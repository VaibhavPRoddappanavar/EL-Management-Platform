import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useFormik } from "formik";
import React from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  department: Yup.string().required("Department is required"),
  designation: Yup.string().required("Designation is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const AddTeacherModal = ({ open, onClose, onTeacherAdded }) => {
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      department: "",
      designation: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await axios.post(
          "http://localhost:5000/api/admin/teachers/register-teacher",
          values
        );
        toast.success("Teacher registered successfully");
        onTeacherAdded();
        onClose();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Error registering teacher"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Teacher</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="department"
                label="Department"
                value={formik.values.department}
                onChange={formik.handleChange}
                error={
                  formik.touched.department && Boolean(formik.errors.department)
                }
                helperText={
                  formik.touched.department && formik.errors.department
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="designation"
                label="Designation"
                value={formik.values.designation}
                onChange={formik.handleChange}
                error={
                  formik.touched.designation &&
                  Boolean(formik.errors.designation)
                }
                helperText={
                  formik.touched.designation && formik.errors.designation
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} />
            ) : (
              "Add Teacher"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddTeacherModal;
