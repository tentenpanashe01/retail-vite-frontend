// src/utils/AlertHelper.js
import Swal from "sweetalert2";

// --- Shared Theme ---
const popupTheme = {
  customClass: {
    popup: "small-popup",
    title: "fw-bold text-dark",
    confirmButton: "btn btn-primary",
    cancelButton: "btn btn-secondary ms-2",
  },
  buttonsStyling: false,
  background: "#f8f9fa",
};

// --- Helper object ---
const AlertHelper = {
  success(title = "Success", text = "", timer = 2000) {
    return Swal.fire({
      ...popupTheme,
      icon: "success",
      title,
      text,
      imageUrl: "/logo.png",
      imageWidth: 60,
      imageHeight: 60,
      timer,
      showConfirmButton: false,
    });
  },

  error(title = "Error", text = "Something went wrong!") {
    return Swal.fire({
      ...popupTheme,
      icon: "error",
      title,
      text,
      imageUrl: "/logo.png",
      imageWidth: 60,
      imageHeight: 60,
    });
  },

  warning(title = "Warning", text = "") {
    return Swal.fire({
      ...popupTheme,
      icon: "warning",
      title,
      text,
      imageUrl: "/logo.png",
      imageWidth: 60,
      imageHeight: 60,
    });
  },

  async confirmDelete(item = "item") {
    return Swal.fire({
      ...popupTheme,
      title: `Delete ${item}?`,
      text: `You are about to delete this ${item}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0d1b2a",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      imageUrl: "/logo.png",
      imageWidth: 60,
      imageHeight: 60,
      reverseButtons: true,
    });
  },
};

//  Single, default export
export default AlertHelper;
