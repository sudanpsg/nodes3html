const express = require('express');
const ejs = require('ejs');
//const path = require('path');
const aws = require( 'aws-sdk' );
const multerS3 = require( 'multer-s3' );
//const multerS3 = require( 'multer-s3' );
const multer = require('multer');
const path = require( 'path' );

// Set The Storage Engine
//const storage = multer.diskStorage({
//  destination: './public/uploads/',
//  filename: function(req, file, cb){
//    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//  }
//});

const s3 = new aws.S3({
	accessKeyId: '',
	secretAccessKey: '',
	Bucket: 's3demoupload1'
});

const profileImgUpload = multer({
	storage: multerS3({
		s3: s3,
		bucket: 's3demoupload1',
		acl: 'public-read',
		key: function (req, file, cb) {
			cb(null, path.basename( file.originalname, path.extname( file.originalname ) ) + '-' + Date.now() + path.extname( file.originalname ) )
		}
	}),
	limits:{ fileSize: 2000000 }, // In bytes: 2000000 bytes = 2 MB
	fileFilter: function( req, file, cb ){
		checkFileType( file, cb );
	}
}).single('profileImage');

// Init Upload


// Check File Type
function checkFileType(file, cb){

 const filetypes = /jpeg|jpg|png|gif|pdf/;
  // Check ext
 const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

 const mimetype = filetypes.test(file.mimetype);

 if(mimetype && extname){
   return cb(null,true);
} else {
   cb('Error: Images and PDF Only!');
  }
}

// Init app
const app = express();

// EJS
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static('./public'));

app.get('/', (req, res) => res.render('index'));

app.post('/upload', (req, res) => {
  profileImgUpload( req, res, ( error ) => {
		console.log( 'requestOkokok', req.file );
		console.log( 'error', error );
		if( error ){
			console.log( 'errors', error );
			res.json( { error: error } );
		} else {
			// If File not found
			if( req.file === undefined ){
				console.log( 'Error: No File Selected!' );
				res.json( 'Error: No File Selected' );
			} else {
				// If Success
				const imageName = req.file.key;
				const imageLocation = req.file.location;
// Save the file name into database into profile model
		//		res.json( {
		//			image: imageName,
		//			location: imageLocation
		//		} );
        res.render('index',{
          msg:"File upload completed!",
          image:imageLocation
        })
        res.status(200).send()

			}
		}
	});
});

const port = 3000;

app.listen(port, () => console.log(`Server started on port ${port}`));
