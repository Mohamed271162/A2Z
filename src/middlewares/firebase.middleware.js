import admin from "../config/firebase-config.js";
// Firebase Authentication Middleware
export const authenticate = async (req, res, next) => {
	const { idToken } = req.body;
  
	try {
	  const decodedToken = await admin.auth().verifyIdToken(idToken);
	  req.uid = decodedToken.uid;
	  next();
	} catch (error) {
	  res.status(401).json({ error: 'Unauthorized' });
	}
  };


// export class Middleware {
// 	async decodeToken(req, res, next) {
// 		const token = req.headers.authorization
// 		try {
// 			const decodeValue = await admin.auth().verifyIdToken(token);
//             console.log(decodeValue);
// 			if (decodeValue) {
//                 console.log(decodeValue);
// 				return next();
// 			}
// 			return res.json({ message: 'Unauthorized' });
// 		} catch (e) {
//             console.log(e);
// 			return res.json({ message: 'Internal Error' });
// 		}
// 	}
// }
// export default new Middleware()



