// server.js

const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { MongoClient } = require("mongodb");
const { default: mongoose } = require("mongoose");
const { url } = require("./config/db");
const ContactTable = require("./models/contact");
const multer = require('multer');
const Images = require('./models/image');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: "50mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  ); // Allow specified HTTP methods
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  ); // Allow specified headers
  res.setHeader("Access-Control-Allow-Credentials", true); // Allow credentials (e.g., cookies, authorization headers)
  next();
});

function setOtpMail(body) {
  var mailOptions = {
    from: "iamsingh727@gmail.com",
    to: body.to,
    subject: "OTP",
    html: `<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
      style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
      <tr>
          <td>
              <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                  align="center" cellpadding="0" cellspacing="0">
                  <tr>
                      <td style="height:80px;">&nbsp;</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;">
                      <h3 style="font-size:43px; font: normal 36px Open Sans,cursive;">  <a style="text-decoration:none;display: inline-flex;" href="" title="logo" target="_blank">
                          <img width="60" src="https://i.postimg.cc/XNTgVFNp/logo.png" title="logo" alt="logo">
                          <span style="color:#D8A557">Lata Prabhakar</span>
                        </a>
                        </h3>
                      </td>
                  </tr>
                  <tr>
                      <td style="height:20px;">&nbsp;</td>
                  </tr>
                  <tr>
                      <td>
                          <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                              style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                              <tr>
                                  <td style="height:40px;">&nbsp;</td>
                              </tr>
                              <tr>
                                  <td style="padding:0 35px;">
                                      <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Thank You ${body.name}</h1>
                                      <span
                                          style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">We will get back to you very soon.
                                      </p>
                                    
                                  </td>
                              </tr>
                              <tr>
                                  <td style="height:40px;">&nbsp;</td>
                              </tr>
                          </table>
                      </td>
                  <tr>
                      <td style="height:20px;">&nbsp;</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;">
                          <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <a href= "" target="_blank"><strong></strong></a></p>
                      </td>
                  </tr>
                  <tr>
                      <td style="height:80px;">&nbsp;</td>
                  </tr>
              </table>
          </td>
      </tr>
  </table>
</body>`,
  };
  return mailOptions;
}
// API endpoint to send emails
app.post("/send-email", async (req, res) => {
  const { name, to, subject, message } = req.body;
  try {
    // Create a SMTP transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // Replace with your SMTP service provider
      auth: {
        user: "iamsingh727@gmail.com", // Replace with your email address
        pass: "kgcqliylqnffxnrw ", // Replace with your email password
      },
    });

    // Email options
    const mailOptions = {
      from: "iamsingh727@gmail.com", // Sender address
      to: to, // Recipient address
      subject: subject, // Subject line
      html: message, // Plain text body
    };

    const customers = new ContactTable({
      name: name,
      email: to,
      subject: subject,
      message: message,
    });
    // Send email
    const info1  = await transporter.sendMail(mailOptions);
    await transporter.sendMail(setOtpMail(req.body), function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response , info1.response);
      }
    });
    // res.status(200).json({ success: true, message: "Email sent successfully" });
    const savedCustomer = await customers.save();
    res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: savedCustomer,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      console.error("Duplicate key error:", error.message);
      res.status(400).json({
        success: false,
        message: "Email already exists in the database",
      });
    } else {
      // Handle other errors
      console.error("Error sending email:", error);
      res.status(500).json({
        success: false,
        message: "Error sending email",
        error: error.message,
      });
    }
  }
});


//get Images 
// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Middleware to parse JSON
app.use(express.json());

// Route to upload an image
app.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const { originalname, mimetype, path, size } = req.file;
    const image = new Images({
      filename: req.file.filename,
      originalname,
      path,
      contentType: mimetype,
      size
    });

    const savedImage = await image.save();
    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: savedImage,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message,
    });
  }
});
// Route to get all images
app.get('/images', async (req, res) => {
  try {
    const images = await Images.find();
    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({
      success: false,
      message: 'Error fetching images',
      error: error.message,
    });
  }
});
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
