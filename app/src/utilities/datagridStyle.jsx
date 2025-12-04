export const DataGridStyle = {
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: "white",
      zIndex: 1,
    },
    '& .MuiDataGrid-columnHeader[data-field="actions"]': {
      position: 'sticky',
      right: 0,
      backgroundColor: "white",
      zIndex: 1,
    },
    '& .MuiDataGrid-cell[data-field="actions"]': {
      position: 'sticky',
      right: 0,
      backgroundColor: "white",
      zIndex: 1,
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    '& .MuiDataGrid-cell:focus': {
      outline: 'none',
    },
    '& .MuiDataGrid-cell:focus-within': {
      outline: 'none',
    },
  }
  