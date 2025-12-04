import '../styles/Login.css'
import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material'
import { useState } from 'react';
import { DoubleArrow, Visibility, VisibilityOff } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { showSnackbar } from '../redux/slices/snackbar';


const Login = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);
  const [credentials, setCredentials] = useState({ acc_uname: '', acc_pass: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlechange = e => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  }

  const handlesubmit = async () => {
    try {
      const result = await dispatch(login(credentials));
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(showSnackbar({ message: "Logged In Successfully", severity: 'success', }));
        navigate('/');
      }else {
        dispatch(showSnackbar({ message: result.payload, severity: 'error', }));
      }
    } catch (error) {
      console.error(error)
    }
  }


  return (
    <section className="login-container">
      <div className="wrapper"></div>
      <div></div>
      {/* <div className="image-container">
        <img src="/login.gif" width={"100%"} alt="" />
      </div> */}
      <div className="login-form">
        <div style={{display: "flex", justifyContent: "start", alignItems: "center", marginBottom: "1rem"}}>
          {/* <img src="./shyamlogo.png" width={120} alt="" />
          <DoubleArrow /> */}
          <img src="./SMARTPARCHI.png" width={80} alt="" />
        </div>
        <h1 className="login-title">Authentication</h1>
        <TextField className="text-field" label="Email Id / Username" variant="filled" fullWidth
          name="acc_uname"
          value={credentials.acc_uname}
          onChange={handlechange}
        />

        <TextField className="text-field" label="Password" variant="filled" fullWidth
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <div onClick={handleTogglePasswordVisibility} style={{marginBottom: "-10px", cursor: "pointer"}}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </div>
            ),
          }}
          name="acc_pass"
          value={credentials.acc_pass}
          onChange={handlechange}
        />


        <FormControlLabel checked control={<Checkbox />} label="Remember Me" />

        <div>
          <a className="forgot-password" href="">Forgot Password ?</a>
        </div>

        <Button size="large" variant="contained" style={{borderRadius: "25px"}} disabled={loading} onClick={handlesubmit}>Login</Button>
        
      </div>
    </section>
    
  )
}

export default Login