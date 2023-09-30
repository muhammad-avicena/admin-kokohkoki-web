import { useState, useEffect, useCallback } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../../utils/firebase";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { DEV_API_URL } from "../../utils/constants/api";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import jwtDecode from "jwt-decode";
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
  const [editData, setEditData] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [image3, setImage3] = useState("");
  const [decodedToken, setDecodedToken] = useState(null);

  const validate = sessionStorage.getItem("userToken");
  const storage = getStorage();

  if (!validate) {
    window.location.href = "/";
  }

  useEffect(() => {
    try {
      const decoded = jwtDecode(validate);
      setDecodedToken(decoded);
    } catch (error) {
      console.error("JWT decoding failed:", error.message);
    }
    // eslint-disable-next-line
  }, []);

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

  const handleEditModal = () => {
    setEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditModal(false);
  };

  useEffect(() => {
    if (app) {
      console.log("Firebase is initialized:", app);
    } else {
      console.log("Firebase is not initialized.");
    }
  }, []);

  const handleAddFish = async (values, { resetForm }) => {
    const fishImage1Ref = ref(storage, `fish_images/${image1.name}`);
    const fishImage2Ref = ref(storage, `fish_images/${image2.name}`);
    const fishImage3Ref = ref(storage, `fish_images/${image3.name}`);

    try {
      const imageUrls = {};

      if (image1) {
        await uploadBytes(fishImage1Ref, image1);
        imageUrls.image1 = await getDownloadURL(fishImage1Ref);
      }
      if (image2) {
        await uploadBytes(fishImage2Ref, image2);
        imageUrls.image2 = await getDownloadURL(fishImage2Ref);
      }
      if (image3) {
        await uploadBytes(fishImage3Ref, image3);
        imageUrls.image3 = await getDownloadURL(fishImage3Ref);
      }

      values.image1 = imageUrls.image1;
      values.image2 = imageUrls.image2;
      values.image3 = imageUrls.image3;

      axios
        .post(`${DEV_API_URL}/fish`, values, {
          headers: { Authorization: `Bearer ${validate}` },
        })
        .then((response) => {
          console.log(response.data);
          fetchData();
          handleCloseAddModal();
          Swal.fire({
            icon: "success",
            title: "Add Fish Successful",
            text: "You have successfully added a new fish.",
          });
          resetForm();
          setImage1(null);
          setImage2(null);
          setImage3(null);
        })
        .catch((error) => {
          handleCloseAddModal();
          console.log(error);
          resetForm();
          setImage1(null);
          setImage2(null);
          setImage3(null);
          Swal.fire({
            icon: "error",
            title: "Failed to Add Fish",
            text: `An error occurred while processing your request. ${error.message} `,
          });
        });
    } catch (error) {
      console.error("Error uploading images:", error.message);
    }
  };

  const handleEditFish = async () => {
    console.log(editData);
    const fishImage1Ref = ref(storage, `fish_images/${image1?.name}`);
    const fishImage2Ref = ref(storage, `fish_images/${image2?.name}`);
    const fishImage3Ref = ref(storage, `fish_images/${image3?.name}`);

    try {
      const imageUrls = {};

      if (image1) {
        await uploadBytes(fishImage1Ref, image1);
        imageUrls.image1 = await getDownloadURL(fishImage1Ref);
      }
      if (image2) {
        await uploadBytes(fishImage2Ref, image2);
        imageUrls.image2 = await getDownloadURL(fishImage2Ref);
      }
      if (image3) {
        await uploadBytes(fishImage3Ref, image3);
        imageUrls.image3 = await getDownloadURL(fishImage3Ref);
      }

      axios
        .put(
          `${DEV_API_URL}/fish/${editData._id}`,
          {
            ...editData,
            ...imageUrls,
          },
          {
            headers: { Authorization: `Bearer ${validate}` },
          }
        )
        .then((response) => {
          console.log(response.data);
          fetchData();
          handleCloseEditModal();
          Swal.fire({
            icon: "success",
            title: "Add Fish Successful",
            text: "You have successfully added a new fish.",
          });
          setImage1(null);
          setImage2(null);
          setImage3(null);
        })
        .catch((error) => {
          handleCloseEditModal();
          console.log(error);
          setImage1(null);
          setImage2(null);
          setImage3(null);
          Swal.fire({
            icon: "error",
            title: "Failed to Edit Fish",
            text: `An error occurred while processing your request. ${error.message} `,
          });
        });
    } catch (error) {
      console.error("Error uploading images:", error.message);
    }
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
              text: `An error occurred while processing your request. ${error.message} `,
            });
          });
      }
    });
  };

  const handleImage1Change = (event) => {
    const file = event.currentTarget.files[0];
    console.log(file);
    setImage1(file);
  };

  const handleImage2Change = (event) => {
    const file = event.currentTarget.files[0];
    setImage2(file);
  };

  const handleImage3Change = (event) => {
    const file = event.currentTarget.files[0];
    setImage3(file);
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
              e.stopPropagation();
              handleEditModal();
              // navigate(`/edit/${params.row.name}`);
              setEditData(params.row);
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
  const handleLogout = () => {
    sessionStorage.removeItem("userToken");
    window.location.href = "/";
  };

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
                  Add
                </Button>
              </DialogActions>
            </Form>
          </Dialog>
        )}
      </Formik>

      <Dialog open={editModal} onClose={handleCloseEditModal}>
        <DialogTitle>Edit Fish</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                type="text"
                name="name"
                label="Name"
                fullWidth
                value={editData?.name || ""}
                onChange={(e) => {
                  setEditData({ ...editData, name: e.target.value });
                }}
                style={{ margin: "5px 0" }}
              />

              <TextField
                type="text"
                name="type"
                label="Type"
                fullWidth
                style={{ margin: "5px 0" }}
                value={editData?.type || ""}
                onChange={(e) => {
                  setEditData({ ...editData, type: e.target.value });
                }}
              />
              <TextField
                type="text"
                name="size"
                label="Size"
                fullWidth
                style={{ margin: "5px 0" }}
                value={editData?.size || ""}
                onChange={(e) => {
                  setEditData({ ...editData, size: e.target.value });
                }}
              />
              <TextField
                type="number"
                name="price"
                label="Price (Rp)"
                fullWidth
                style={{ margin: "5px 0" }}
                value={editData?.price || ""}
                onChange={(e) => {
                  setEditData({ ...editData, price: e.target.value });
                }}
              />
              <TextField
                type="text"
                name="gender"
                label="Gender"
                select
                fullWidth
                style={{ margin: "5px 0" }}
                value={editData?.gender || ""}
                onChange={(e) => {
                  setEditData({ ...editData, gender: e.target.value });
                }}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="text"
                name="isAvailable"
                label="Available"
                select
                fullWidth
                value={editData?.isAvailable || ""}
                onChange={(e) => {
                  setEditData({
                    ...editData,
                    isAvailable: e.target.value,
                  });
                }}
                style={{ margin: "10px 0" }}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </TextField>

              <TextField
                type="text"
                name="desc"
                label="Desc (optional)"
                fullWidth
                style={{ margin: "5px 0" }}
                value={editData?.desc || ""}
                onChange={(e) => {
                  setEditData({
                    ...editData,
                    desc: e.target.value,
                  });
                }}
              />

              <TextField
                type="text"
                name="videoURL"
                label="Video URL (optional)"
                fullWidth
                style={{ margin: "5px 0" }}
                value={editData?.videoURL || ""}
                onChange={(e) => {
                  setEditData({
                    ...editData,
                    videoURL: e.target.value,
                  });
                }}
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
              <label htmlFor="image-upload-2" style={{ marginTop: "30px" }}>
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
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button
            onClick={() => {
              handleEditFish();
            }}
            variant="contained"
            color="primary"
            type="submit"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Container
        sx={{
          width: "100%",
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
            onClick={handleLogout}
            style={{ margin: "20px 0" }}
          >
            Logout
          </Button>

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
        </Paper>
      </Container>
    </>
  );
};

export default Dashboard;
