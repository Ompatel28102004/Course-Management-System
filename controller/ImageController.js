import {uploadFile} from "../cloudinary_image.js";

export const uploadImageController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ success: false, msg: 'No file uploaded' });
    }

    const upload = await uploadFile(req.file.path);

    // // Save the secure URL to the Store model
    // const store = new Store({
    //   file_url: upload.secure_url,
    // });
    // const record = await store.save();
    res.status(201).send({
      success: true,
      msg: 'File Uploaded Successfully!',
      data: {
        file_url: upload.secure_url,
        public_id: upload.public_id,
        version: upload.version,
        created_at: upload.created_at,
        format: upload.format,
        width: upload.width,
        height: upload.height,
      },
    });
  } catch (error) {
    console.error("File upload error:", error.message);
    res.status(500).send({ success: false, msg: error.message });
  }
};
