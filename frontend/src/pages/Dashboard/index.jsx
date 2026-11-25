import "./dashboard.css";

import React from "react";
import { Box, Button, InputAdornment, LinearProgress, MenuItem, Select, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import { FileDownloadOutlined, Search } from "@mui/icons-material";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router";
import moment from "moment";
import * as XLSX from "xlsx";
import axiosInstance from "../../config/axiosInstance";

const defaultFilters = {
  plantId: "",
  locationId: "",
  nameOfMouza: "",
  mutatedInCompany: "",
  nameOfPurchaser: "",
  fromDate: "",
  toDate: "",
  search: "",
};

const EMPTY_SUMMARY = {
  landPosition: { plotArea: 0, purchasedArea: 0, notPurchasedArea: 0, notPurchasedPlots: 0, excessArea: 0, excessPlots: 0 },
  counts: { deeds: 0, plots: 0, mouzas: 0, records: 0 },
  mutation: { purchasedArea: 0, mutatedArea: 0, pendingArea: 0, pendingPlots: 0 },
  pendingByCompany: [],
};
const EMPTY_OPTIONS = { plants: [], locations: [], mouzas: [], mutatedInCompanies: [], purchasers: [] };

const CHART_TABS = [
  { value: "mouza", label: "MOUZA", plural: "mouzas" },
  { value: "location", label: "LOCATION", plural: "locations" },
  { value: "company", label: "COMPANY", plural: "companies" },
  { value: "plant", label: "PLANT", plural: "plants" },
];
const PENDING_TABS = [
  { value: "mouza", label: "MOUZA" },
  { value: "purchaser", label: "PURCHASER" },
];

const fmt = (n) => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n) => Number(n || 0).toLocaleString("en-US");
const pct = (value, total) => (total > 0 ? (value / total) * 100 : 0);
const pctText = (value, total) => `${pct(value, total).toFixed(1)}%`;
const shortLabel = (text = "") => (text.length > 9 ? `${text.slice(0, 8)}.` : text);
const kFormat = (n) => (n >= 1000 ? `${Number((n / 1000).toFixed(1))}k` : n);

// GET helper: refetches whenever path / params change and ignores stale responses
const useApi = (path, params, initial) => {
  const [data, setData] = React.useState(initial);
  const [loading, setLoading] = React.useState(false);
  const key = JSON.stringify(params);

  React.useEffect(() => {
    let ignore = false;
    setLoading(true);
    axiosInstance.get(path, { params })
      .then((res) => { if (!ignore) setData(res.data.data); })
      .catch(console.error)
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [path, key]);

  return [data, loading];
};

const Tabs = ({ tabs, value, onChange }) => (
  <div className="dash-tabs">
    {tabs.map((tab) => (
      <button key={tab.value} className={`dash-tab ${value === tab.value ? "active" : ""}`} onClick={() => onChange(tab.value)}>
        {tab.label}
      </button>
    ))}
  </div>
);

const FilterSelect = ({ label, allLabel, value, options, onChange }) => (
  <>
    <label className="dash-filter-label">{label}</label>
    <Select size="small" fullWidth displayEmpty value={value} onChange={(e) => onChange(e.target.value)} sx={{ fontSize: 13 }}>
      <MenuItem value="">{allLabel}</MenuItem>
      {options.map((opt) => {
        const item = typeof opt === "string" ? { value: opt, label: opt } : opt;
        return <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>;
      })}
    </Select>
  </>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [filters, setFilters] = React.useState(defaultFilters);
  const [applied, setApplied] = React.useState(defaultFilters);
  const [chartGroup, setChartGroup] = React.useState("mouza");
  const [pendingGroup, setPendingGroup] = React.useState("mouza");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [tableSearchInput, setTableSearchInput] = React.useState("");
  const [tableSearch, setTableSearch] = React.useState("");
  const [updatedAt, setUpdatedAt] = React.useState("");

  React.useEffect(() => {
    document.title = "Dashboard";
  }, []);

  // filters are applied after a short pause and always restart the table from page 1
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setApplied(filters);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTableSearch(tableSearchInput);
      setPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [tableSearchInput]);

  const [options] = useApi("/dashboard/filters", {}, EMPTY_OPTIONS);
  const [summary, summaryLoading] = useApi("/dashboard/summary", applied, EMPTY_SUMMARY);
  const [chart, chartLoading] = useApi("/dashboard/plot-vs-purchased", { ...applied, groupBy: chartGroup }, { rows: [], totalGroups: 0 });
  const [pending, pendingLoading] = useApi("/dashboard/pending-mutation", { ...applied, groupBy: pendingGroup }, { rows: [] });
  const [pendingPlots, plotsLoading] = useApi(
    "/dashboard/pending-plots",
    { ...applied, tableSearch, page: page + 1, limit: rowsPerPage },
    { rows: [], totalCount: 0 }
  );

  React.useEffect(() => {
    setUpdatedAt(moment().format("DD-MM-YYYY, h:mm A"));
  }, [summary]);

  const loading = summaryLoading || chartLoading || pendingLoading || plotsLoading;
  const { landPosition: land, counts, mutation, pendingByCompany } = summary;
  const chartTab = CHART_TABS.find((t) => t.value === chartGroup);
  const maxPending = Math.max(...pending.rows.map((r) => r.pending), 0);
  const maxCompany = Math.max(...pendingByCompany.map((c) => c.purchased), 0);

  const handleFilterChange = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));

  const handleExport = async () => {
    try {
      const res = await axiosInstance.get("/dashboard/pending-plots", { params: { ...applied, limit: 100000 } });
      const plotRows = res.data.data.rows.map((r) => ({
        "Plot No": r.plotNo,
        Mouza: r.nameOfMouza,
        "Mutated In Company": r.mutatedInCompany,
        Purchaser: r.purchaser,
        "Pending Area": r.pendingArea,
        "Pending Since": r.pendingSince ? moment(r.pendingSince).format("DD-MM-YYYY") : "",
        "Deed No": r.deedNo,
      }));
      const summaryRows = [
        ["Plot area", land.plotArea],
        ["Purchased area", land.purchasedArea],
        ["Not yet purchased", land.notPurchasedArea],
        ["Excess purchased", land.excessArea],
        ["Mutated area", mutation.mutatedArea],
        ["Pending mutation", mutation.pendingArea],
        ["Deeds", counts.deeds],
        ["Plots", counts.plots],
        ["Mouzas", counts.mouzas],
        ["Register records", counts.records],
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Metric", "Value"], ...summaryRows]), "Summary");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(plotRows), "Pending Plots");
      XLSX.writeFile(wb, `Dashboard_${moment().format("YYYYMMDD_HHmm")}.xlsx`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box className="dash">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">Land position and mutation status across all plants</p>
        </div>
        <div className="dash-header-actions">
          <TextField size="small" className="dash-search" placeholder="Search plot no." value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          />
          <Button variant="outlined" className="dash-export" onClick={handleExport}>Export</Button>
        </div>
      </div>

      {loading && <LinearProgress sx={{ mb: 1 }} />}

      <div className="dash-body">
        <div className="dash-main">

          {/* Land position */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h2 className="dash-card-title">Land position <span className="dash-card-sub">Plot, purchased and outstanding area (dec)</span></h2>
            </div>

            <div className="dash-metrics">
              <div>
                <div className="dash-metric-label"><i className="dash-dot" style={{ background: "var(--dash-grey)" }} /> Plot area</div>
                <div className="dash-metric-value">{fmt(land.plotArea)}</div>
                <div className="dash-metric-note">{fmtInt(counts.plots)} plots</div>
              </div>
              <div>
                <div className="dash-metric-label"><i className="dash-dot" style={{ background: "var(--dash-blue)" }} /> Purchased area</div>
                <div className="dash-metric-value">{fmt(land.purchasedArea)}</div>
                <div className="dash-metric-note">{pctText(land.purchasedArea, land.plotArea)} of plot area</div>
              </div>
              <div>
                <div className="dash-metric-label"><i className="dash-dot" style={{ background: "#9ca3af" }} /> Not yet purchased</div>
                <div className="dash-metric-value">{fmt(land.notPurchasedArea)}</div>
                <div className="dash-metric-note">
                  {fmtInt(land.notPurchasedPlots)} plots · <button className="dash-link" onClick={() => navigate("/deed")}>View plots ›</button>
                </div>
              </div>
              <div>
                <div className="dash-metric-label"><i className="dash-dot" style={{ background: "var(--dash-red)" }} /> Excess purchased</div>
                <div className="dash-metric-value red">{fmt(land.excessArea)}</div>
                <div className="dash-metric-note">
                  {fmtInt(land.excessPlots)} plots · <button className="dash-link" onClick={() => navigate("/deed")}>View plots ›</button>
                </div>
              </div>
            </div>

            <div className="dash-bar">
              <span style={{ width: `${Math.min(pct(land.purchasedArea, land.plotArea), 100)}%`, background: "var(--dash-blue)" }} />
            </div>
            <div className="dash-bar-caption">{pctText(land.purchasedArea, land.plotArea)} of total plot area purchased</div>

            <div className="dash-stats">
              <div><b>{fmtInt(counts.deeds)}</b><span>Deeds</span></div>
              <div><b>{fmtInt(counts.plots)}</b><span>Plots</span></div>
              <div><b>{fmtInt(counts.mouzas)}</b><span>Mouzas</span></div>
              <div><b>{fmtInt(counts.records)}</b><span>Register records</span></div>
            </div>
          </div>

          {/* Plot vs purchased area */}
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <h2 className="dash-card-title">Plot vs purchased area</h2>
                <div className="dash-metric-note">Top 10 {chartTab.plural} by plot area (dec)</div>
              </div>
              <div className="dash-legend">
                <span><i className="dash-dot" style={{ background: "var(--dash-grey)" }} /> Plot area</span>
                <span><i className="dash-dot" style={{ background: "var(--dash-blue)" }} /> Purchased</span>
              </div>
            </div>

            <Tabs tabs={CHART_TABS} value={chartGroup} onChange={setChartGroup} />

            <Box height={240}>
              {chart.rows.length === 0 ? (
                <div className="dash-empty">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart.rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
                    <CartesianGrid vertical={false} stroke="#eef0f4" />
                    <XAxis dataKey="name" tickFormatter={shortLabel} tickLine={false} axisLine={{ stroke: "#d1d5db" }} tick={{ fontSize: 11, fill: "#374151" }} interval={0} />
                    <YAxis tickFormatter={kFormat} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6b7280" }} width={40} />
                    <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} formatter={(value, name) => [value, name]} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12, }} />
                    <Bar dataKey="plotArea" name="Plot area" fill="#c9ced6" radius={[2, 2, 0, 0]} barSize={12} />
                    <Bar dataKey="purchasedArea" name="Purchased" fill="#2563eb" radius={[2, 2, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
            <button className="dash-link" style={{ fontSize: 12 }} onClick={() => navigate("/summary")}>
              View all {fmtInt(chart.totalGroups)} {chartTab.plural} ›
            </button>
          </div>

          {/* Mutation */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h2 className="dash-card-title">Mutation <span className="dash-card-sub">Purchased land recorded in a group company's name</span></h2>
            </div>

            <div className="dash-metrics two">
              <div>
                <div className="dash-metric-label"><i className="dash-dot" style={{ background: "var(--dash-green)" }} /> Mutated area</div>
                <div className="dash-metric-value">{fmt(mutation.mutatedArea)}</div>
                <span className="dash-pill green">{pctText(mutation.mutatedArea, mutation.purchasedArea)} of purchased</span>
              </div>
              <div>
                <div className="dash-metric-label"><i className="dash-dot" style={{ background: "var(--dash-orange)" }} /> Pending mutation</div>
                <div className="dash-metric-value">{fmt(mutation.pendingArea)}</div>
                <span className="dash-pill amber">{pctText(mutation.pendingArea, mutation.purchasedArea)} of purchased · {fmtInt(mutation.pendingPlots)} plots</span>
              </div>
            </div>

            <div className="dash-bar">
              <span style={{ width: `${Math.min(pct(mutation.mutatedArea, mutation.purchasedArea), 100)}%`, background: "var(--dash-green)" }} />
              <span style={{ width: `${Math.min(pct(mutation.pendingArea, mutation.purchasedArea), 100)}%`, background: "var(--dash-orange)" }} />
            </div>
            <div className="dash-bar-captions">
              <span>Mutated {pctText(mutation.mutatedArea, mutation.purchasedArea)}</span>
              <span>Pending {pctText(mutation.pendingArea, mutation.purchasedArea)}</span>
            </div>
          </div>

          {/* Pending mutation + Pending by company */}
          <div className="dash-two-col">
            <div className="dash-card">
              <h2 className="dash-card-title" style={{ marginBottom: 8 }}>Pending mutation</h2>
              <Tabs tabs={PENDING_TABS} value={pendingGroup} onChange={setPendingGroup} />
              <div className="dash-bars">
                {pending.rows.length === 0 && <div className="dash-empty">No pending mutation</div>}
                {pending.rows.map((row) => (
                  <div className="dash-bars-row" key={row.name}>
                    <div className="dash-bars-label" title={row.name}>{row.name}</div>
                    <div className="dash-bars-track">
                      <div className="dash-bars-fill" style={{ width: `${Math.max(pct(row.pending, maxPending) * 0.75, 2)}%` }} />
                      <span className="dash-bars-value">{fmt(row.pending)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dash-card">
              <div className="dash-card-head" style={{ marginBottom: 14 }}>
                <h2 className="dash-card-title">Pending by company</h2>
                <div className="dash-legend">
                  <span><i className="dash-dot" style={{ background: "var(--dash-green)" }} /> Mutated</span>
                  <span><i className="dash-dot" style={{ background: "var(--dash-orange)" }} /> Pending</span>
                </div>
              </div>
              {pendingByCompany.length === 0 && <div className="dash-empty">No data</div>}
              {pendingByCompany.map((company) => (
                <div className="dash-company" key={company.name}>
                  <div className="dash-company-head">
                    <span className="dash-company-name" title={company.name}>{company.name}</span>
                    <b>{fmt(company.pending)} pending</b>
                  </div>
                  <div className="dash-bar">
                    <span style={{ width: `${Math.min(pct(company.mutated, maxCompany), 100)}%`, background: "var(--dash-green)" }} />
                    <span style={{ width: `${Math.min(pct(Math.max(company.pending, 0), maxCompany), 100)}%`, background: "var(--dash-orange)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plots with pending mutation */}
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <h2 className="dash-card-title">Plots with pending mutation</h2>
                <div className="dash-metric-note">{fmtInt(pendingPlots.totalCount)} plots · sorted by pending area</div>
              </div>
              <TextField size="small" className="dash-table-search" placeholder="Search plot, mouza, deed" value={tableSearchInput}
                onChange={(e) => setTableSearchInput(e.target.value)} />
            </div>

            <Box sx={{ overflowX: "auto" }}>
              <Table size="small" className="dash-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Plot no</TableCell>
                    <TableCell>Mouza</TableCell>
                    <TableCell>Mutated-in-company</TableCell>
                    <TableCell>Purchaser</TableCell>
                    <TableCell className="num">Pending area ↓</TableCell>
                    <TableCell>Pending since</TableCell>
                    <TableCell>Deed no</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingPlots.rows.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="dash-empty">No plots with pending mutation</TableCell></TableRow>
                  )}
                  {pendingPlots.rows.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.plotNo}</TableCell>
                      <TableCell>{row.nameOfMouza}</TableCell>
                      <TableCell>{row.mutatedInCompany}</TableCell>
                      <TableCell>{row.purchaser}</TableCell>
                      <TableCell className="num">{fmt(row.pendingArea)}</TableCell>
                      <TableCell>{row.pendingSince ? moment(row.pendingSince).format("DD-MM-YYYY") : ""}</TableCell>
                      <TableCell>
                        <button className="dash-link" onClick={() => navigate("/deed")}>{row.deedNo} ›</button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <TablePagination component="div" count={pendingPlots.totalCount} page={page} rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="dash-rail">
          <div className="dash-card">
            <div className="dash-filters-head">
              <h2 className="dash-card-title">Filters</h2>
              <button className="dash-link" style={{ fontSize: 12 }} onClick={() => setFilters(defaultFilters)}>Clear all</button>
            </div>

            <FilterSelect label="Plant" allLabel="All plants" value={filters.plantId} options={options.plants} onChange={(v) => handleFilterChange("plantId", v)} />
            <FilterSelect label="Location" allLabel="All locations" value={filters.locationId} options={options.locations} onChange={(v) => handleFilterChange("locationId", v)} />
            <FilterSelect label="Mouza" allLabel="All mouzas" value={filters.nameOfMouza} options={options.mouzas} onChange={(v) => handleFilterChange("nameOfMouza", v)} />
            <FilterSelect label="Mutated-in company" allLabel="All companies" value={filters.mutatedInCompany} options={options.mutatedInCompanies} onChange={(v) => handleFilterChange("mutatedInCompany", v)} />
            <FilterSelect label="Purchaser" allLabel="All purchasers" value={filters.nameOfPurchaser} options={options.purchasers} onChange={(v) => handleFilterChange("nameOfPurchaser", v)} />

            <label className="dash-filter-label">Registered from</label>
            <TextField type="date" size="small" fullWidth value={filters.fromDate} onChange={(e) => handleFilterChange("fromDate", e.target.value)} />
            <label className="dash-filter-label">Registered to</label>
            <TextField type="date" size="small" fullWidth value={filters.toDate} onChange={(e) => handleFilterChange("toDate", e.target.value)} />

            <div className="dash-note">All areas in decimals (dec)</div>
          </div>
          <Typography className="dash-updated">Updated {updatedAt}</Typography>
        </div>
      </div>
    </Box>
  );
}