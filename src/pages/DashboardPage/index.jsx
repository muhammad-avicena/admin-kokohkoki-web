import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { DEV_API_URL } from "../../utils/constants/api";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
// import { useFetchList } from "../../hooks";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Container,
  Paper,
  Grid,
  Typography,
} from "@mui/material";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  type: Yup.string().required("Type is required"),
  price: Yup.number().required("Price is required"),
  gender: Yup.string().required("Gender is required"),
  size: Yup.string().required("Size is required"),
  isAvailable: Yup.string().required("Available is required"),
  videoURL: Yup.string(),
  image1: Yup.string(),
  image2: Yup.string(),
  image3: Yup.string(),
  desc: Yup.string(),
});

const initialValuesAdd = {
  name: "",
  type: "",
  price: "",
  gender: "",
  size: "",
  isAvailable: true,
  videoURL: "",
  image1: "",
  image2: "",
  image3: "",
  desc: "",
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");
  const [decodedToken, setDecodedToken] = useState(null);

  const validate = sessionStorage.getItem("userToken");

  useEffect(() => {
    // Decode the token
    try {
      const decoded = jwtDecode(validate);

      // The decoded payload is stored in the `decoded` variable
      setDecodedToken(decoded);
    } catch (error) {
      // Handle decoding errors if needed
      console.error("JWT decoding failed:", error.message);
    }
    // eslint-disable-next-line
  }, []);

  console.log(decodedToken);

  const fetchData = useCallback(() => {
    axios
      .get(`${DEV_API_URL}/fish`)
      .then((response) => {
        console.log(response.data.data);
        setData(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddModal = () => {
    setAddModal(true);
  };

  const handleCloseAddModal = () => {
    setAddModal(false);
  };

  const handleAddFish = (values, { resetForm }) => {
    console.log(values);
    axios
      .post(
        `${DEV_API_URL}/fish`,
        {
          name: values.name,
          type: values.type,
          price: values.price,
          gender: values.gender,
          size: values.size,
          isAvailable: values.isAvailable,
          videoURL: values.videoURL,
          image1: image1 ? image1 : null,
          image2: image2 ? image2 : null,
          image3: image3 ? image3 : null,
          desc: values.desc,
        },
        { headers: { Authorization: `Bearer ${validate}` } }
      )
      .then((response) => {
        console.log(response.data);
        fetchData();
        handleCloseAddModal();
        Swal.fire({
          icon: "success",
          title: "Add Fish Successful",
          text: "You have successfully added a new fish.",
        });
        setImage1("");
        setImage2("");
        setImage3("");
        resetForm();
      })
      .catch((error) => {
        console.log(error);
        Swal.fire({
          icon: "error",
          title: "Failed to Add Fish",
          text: "An error occurred while processing your request. Please try again later.",
        });
      });
  };

  const handleDeleteFish = (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Once you delete, you won't get this data back !",
      icon: "warning",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${DEV_API_URL}/fish/${row._id}`, {
            headers: { Authorization: `Bearer ${validate}` },
          })
          .then((response) => {
            console.log(response.data);
            fetchData();
            Swal.fire({
              icon: "success",
              title: "Delete Fish Successful",
              text: "You have successfully deleted a fish.",
            });
          })
          .catch((error) => {
            console.log(error);
            Swal.fire({
              icon: "error",
              title: "Failed to Delete Fish",
              text: "An error occurred while processing your request. Please try again later.",
            });
          });
      }
    });
  };

  const handleImage1Change = (event) => {
    const file = event.currentTarget.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64Image = e.target.result;
        setImage1(base64Image);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleImage2Change = (event) => {
    const file = event.currentTarget.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64Image = e.target.result;
        setImage2(base64Image);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleImage3Change = (event) => {
    const file = event.currentTarget.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64Image = e.target.result;
        setImage3(base64Image);
      };

      reader.readAsDataURL(file);
    }
  };

  const columns = [
    {
      field: "_id",
      headerName: "ID",
      width: 80,
    },
    { field: "name", headerName: "Fish name", width: 130 },
    { field: "type", headerName: "Type", width: 130 },
    {
      field: "gender",
      headerName: "Gender",
      type: "string",
      width: 70,
    },
    { field: "size", headerName: "Size", width: 80 },
    { field: "price", headerName: "Price (Rp)", type: "number", width: 130 },
    {
      field: "isAvailable",
      headerName: "Available",
      width: 90,
      renderCell: (params) => (params.value ? "Yes" : "No"),
    },
    {
      filed: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <div>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={(e) => {
              console.log(params.row);
              e.stopPropagation();
              // handleEditData(params.row);
            }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            style={{ marginLeft: 5 }}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFish(params.row);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Formik
        initialValues={initialValuesAdd}
        validationSchema={validationSchema}
        onSubmit={handleAddFish}
      >
        {({ touched, errors }) => (
          <Dialog open={addModal} onClose={handleCloseAddModal}>
            <Form>
              <DialogTitle>Add Fish</DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Field
                      type="text"
                      name="name"
                      label="Name"
                      as={TextField}
                      fullWidth
                      style={{ margin: "5px 0" }}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />

                    <Field
                      type="text"
                      name="type"
                      label="Type"
                      as={TextField}
                      fullWidth
                      style={{ margin: "5px 0" }}
                      error={touched.type && Boolean(errors.type)}
                      helperText={touched.type && errors.type}
                    />
                    <Field
                      type="text"
                      name="size"
                      label="Size"
                      as={TextField}
                      fullWidth
                      style={{ margin: "5px 0" }}
                      error={touched.size && Boolean(errors.size)}
                      helperText={touched.size && errors.size}
                    />
                    <Field
                      type="number"
                      name="price"
                      label="Price (Rp)"
                      as={TextField}
                      fullWidth
                      style={{ margin: "5px 0" }}
                      error={touched.price && Boolean(errors.price)}
                      helperText={touched.price && errors.price}
                    />
                    <Field
                      type="text"
                      name="gender"
                      label="Gender"
                      as={TextField}
                      select
                      fullWidth
                      style={{ margin: "5px 0" }}
                      error={touched.gender && Boolean(errors.gender)}
                      helperText={touched.gender && errors.gender}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </Field>
                  </Grid>
                  <Grid item xs={6}>
                    <Field
                      type="text"
                      name="isAvailable"
                      label="Available"
                      as={TextField}
                      select
                      fullWidth
                      error={touched.isAvailable && Boolean(errors.isAvailable)}
                      helperText={touched.isAvailable && errors.isAvailable}
                      style={{ margin: "10px 0" }}
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Field>

                    <Field
                      type="text"
                      name="desc"
                      label="Desc (optional)"
                      as={TextField}
                      fullWidth
                      style={{ margin: "5px 0" }}
                      error={touched.desc && Boolean(errors.desc)}
                      helperText={touched.desc && errors.desc}
                    />

                    <Field
                      type="text"
                      name="videoURL"
                      label="Video URL (optional)"
                      as={TextField}
                      fullWidth
                      style={{ margin: "5px 0" }}
                      error={touched.videoURL && Boolean(errors.videoURL)}
                      helperText={touched.videoURL && errors.videoURL}
                    />

                    <label htmlFor="image-upload-1">
                      Image 1 Tumbnail (Optional)
                      <input
                        type="file"
                        name="image1"
                        accept="image/*"
                        id="image-upload-1"
                        onChange={handleImage1Change}
                      />
                    </label>
                    <label
                      htmlFor="image-upload-2"
                      style={{ marginTop: "30px" }}
                    >
                      Image 2 (Optional)
                      <input
                        type="file"
                        name="image2"
                        accept="image/*"
                        id="image-upload-2"
                        onChange={handleImage2Change}
                      />
                    </label>

                    <label htmlFor="image-upload-3">
                      Image 3 (Optional)
                      <input
                        type="file"
                        name="image3"
                        accept="image/*"
                        id="image-upload-3"
                        onChange={handleImage3Change}
                      />
                    </label>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseAddModal}>Cancel</Button>
                <Button variant="contained" color="primary" type="submit">
                  Save
                </Button>
              </DialogActions>
            </Form>
          </Dialog>
        )}
      </Formik>
      <Container
        sx={{
          width: "100%",
          height: 250,
        }}
      >
        {/* Profile Data */}
        <Paper elevation={3} style={{ padding: "20px" }}>
          <Typography variant="h6" gutterBottom>
            Profile Data
          </Typography>
          <Typography variant="body2" gutterBottom>
            Name: {decodedToken?.username}
          </Typography>
          <Typography variant="body2" gutterBottom>
            role: {decodedToken?.role}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleAddModal}
            style={{ margin: "10px 10px" }}
          >
            Add New Fish
          </Button>
          <Button
            variant="outlined"
            color="error"
            // onClick={handleLogout}
            style={{ margin: "20px 0" }}
          >
            Logout
          </Button>
        </Paper>
      </Container>

      <div style={{ height: 400, width: 900 }}>
        <DataGrid
          getRowId={(row) => row._id}
          rows={data}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          // checkboxSelection
        />
      </div>
    </>
  );
};

export default Dashboard;
