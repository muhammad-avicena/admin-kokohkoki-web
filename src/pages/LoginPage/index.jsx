import axios from "axios";
import Swal from "sweetalert2";

import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Logo from "../../components/Logo";
import style from "./loginPage.module.css";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="#">
        KokohKoki
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function SignInSide() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const loadingAlert = Swal.fire({
      icon: "info",
      title: "Loading",
      text: "Please wait...",
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false,
    });
    try {
      const data = new FormData(event.currentTarget);
      const response = await axios.post(
        "http://localhost:5001/api/v1/auth/login",
        {
          username: data.get("username"),
          password: data.get("password"),
        }
      );
      sessionStorage.setItem("userToken", response.data.data.token);
      loadingAlert.close();

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "You have successfully logged in. You will be redirected to the dashboard soon...",
      });

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      loadingAlert.close(); 
      console.log(error, "isi error");
      if (error.code === "ERR_NETWORK") {
        Swal.fire({
          icon: "error",
          title: "Internal Server Error",
          text: "An error occurred while processing your request. Please try again later.",
        });
      } 
      if (error.response.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Incorrect username or password. Please try again.",
        });
      }
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: "100%", width: "100%" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              "url(https://kokohkoki.com/assets/about-us/about-us-hero.webp), linear-gradient(rgb(20, 13, 27), rgba(0, 0, 0, 1))",
            backgroundRepeat: "no-repeat",
            backgroundColor: "dark",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Logo className={style.logo} />
            <Typography component="h1" variant="h5">
              Admin Panel
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Usename"
                name="username"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Log In
              </Button>
              {/* <Grid container>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Register Account"}
                  </Link>
                </Grid>
              </Grid> */}
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
