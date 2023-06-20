import { db } from "../../../database/connection";
import { UserProfileSchema } from "../../../database/schema/user";

export const UserProfile = db.model('UserProfile', UserProfileSchema);


// (async()=>{
//   let updated = await UserProfile.updateMany({}, {
//     $rename:{
//       joined_users_count_count : 'joined_users_count'
//     }
//   })
// })();

// async function updateDocuments() {
//     try {
//       await UserProfile.updateMany(
//         { joined_users_count: { $exists: false } },
//         { $set: { joined_users_count: 0 } }
//       );
  
//       console.log('Documents updated successfully.');
//     } catch (error) {
//       console.error('Error updating documents:', error);
//     }
//   }

//   updateDocuments();