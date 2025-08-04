// // src/models/VendorModel.js
// const { admin,db } = require('../config/firebaseAdmin');

// class VendorModel {
//   /**
//    * Creates a new vendor document in Firestore.
//    * @param {object} vendorData - The data for the new vendor.
//    * @returns {Promise<object>} The created vendor document with its ID.
//    */
//   static async createVendor(vendorData) {
//     const newVendorData = {
//       ...vendorData,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       averageRating: 0,
//       totalReviews: 0,
//       status: 'pending',
//       isOpen: true,
//       profileViews: 0,
//       searchImpressions: 0,
//     };

//     try {
//       const docRef = await db.collection('vendors').add(newVendorData);
//       return { id: docRef.id, ...newVendorData };
//     } catch (error) {
//       console.error('Error creating vendor in Firestore:', error);
//       throw new Error('Failed to create vendor profile.');
//     }
//   }

//   /**
//    * Retrieves a vendor document by its ID.
//    * @param {string} vendorId - The ID of the vendor document.
//    * @returns {Promise<object|null>} The vendor document or null if not found.
//    */
//   static async getVendorById(vendorId) {
//     try {
//       const doc = await db.collection('vendors').doc(vendorId).get();
//       if (!doc.exists) {
//         return null;
//       }
//       return { id: doc.id, ...doc.data() };
//     } catch (error) {
//       console.error('Error getting vendor by ID:', error);
//       throw new Error('Failed to retrieve vendor profile.');
//     }
//   }
  

//   /**
//    * Updates an existing vendor document.
//    * @param {string} vendorId - The ID of the vendor document to update.
//    * @param {object} updates - The fields to update.
//    * @returns {Promise<object>} The updated vendor document.
//    */
//   static async updateVendor(vendorId, updates) {
//     try {
//       const vendorRef = db.collection('vendors').doc(vendorId);
//       await vendorRef.update({ ...updates, updatedAt: new Date() });
//       const updatedDoc = await vendorRef.get();
//       return { id: updatedDoc.id, ...updatedDoc.data() };
//     } catch (error) {
//       console.error('Error updating vendor:', error);
//       throw new Error('Failed to update vendor profile.');
//     }
//   }

//   /**
//    * Deletes a vendor document.
//    * @param {string} vendorId - The ID of the vendor document to delete.
//    * @returns {Promise<boolean>} True if deleted successfully.
//    */
//   static async deleteVendor(vendorId) {
//     try {
//       await db.collection('vendors').doc(vendorId).delete();
//       return true;
//     } catch (error) {
//       console.error('Error deleting vendor:', error);
//       throw new Error('Failed to delete vendor profile.');
//     }
//   }

//   /**
//    * Queries vendors based on various parameters.
//    * @param {object} params - Query parameters.
//    * @param {string} [params.category] - Filter by category.
//    * @param {string} [params.search] - Search by business name or description (basic contains).
//    * @param {string} [params.colony] - Filter by colony name.
//    * @param {boolean} [params.isOpen] - Filter by operational status.
//    * @param {string} [params.sortBy] - Field to sort by (e.g., 'averageRating', 'createdAt').
//    * @param {string} [params.sortOrder] - 'asc' or 'desc'.
//    * @returns {Promise<Array<object>>} List of matching vendor documents.
//    */
//   static async getAllVendorsAdmin() {
//     try {
//       const snapshot = await db.collection('vendors').orderBy('createdAt', 'desc').get();
//       return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     } catch (error) {
//       console.error('Error getting all vendors for admin:', error);
//       throw new Error('Failed to retrieve all vendors.');
//     }
//   }

//   /**
//    * Updates the status of a vendor.
//    * @param {string} vendorId - The ID of the vendor.
//    * @param {string} newStatus - The new status ('pending', 'approved', 'suspended', 'rejected').
//    * @returns {Promise<object>} The updated vendor document.
//    */
//   static async updateVendorStatus(vendorId, newStatus) {
//     if (!['pending', 'approved', 'suspended', 'rejected'].includes(newStatus)) {
//       throw new Error('Invalid vendor status provided.');
//     }
//     try {
//       const vendorRef = db.collection('vendors').doc(vendorId);
//       await vendorRef.update({ status: newStatus, updatedAt: new Date() });
//       const updatedDoc = await vendorRef.get();
//       return { id: updatedDoc.id, ...updatedDoc.data() };
//     } catch (error) {
//       console.error('Error updating vendor status:', error);
//       throw new Error('Failed to update vendor status.');
//     }
//   }

//   static async queryVendors(params = {}) {
//     let vendorsRef = db.collection('vendors');
//     let query = vendorsRef;

//     if (params.category) {
//       query = query.where('category', '==', params.category);
//     }
//     if (params.colony) {
//       query = query.where('address.colony', '==', params.colony);
//     }
//     if (params.isOpen !== undefined) {
//       query = query.where('isOpen', '==', params.isOpen);
//     }
//     query = query.where('status', '==', 'approved');

//     const sortBy = params.sortBy || 'createdAt';
//     const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';

//     if (sortBy === 'averageRating') {
//       query = query.orderBy('averageRating', sortOrder);
//     } else if (sortBy === 'createdAt') {
//       query = query.orderBy('createdAt', sortOrder);
//     } else if (sortBy === 'businessName') {
//       query = query.orderBy('businessName', sortOrder);
//     }

//     try {
//       const snapshot = await query.get();
//       let vendorList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//       if (params.search) {
//         const searchTerm = params.search.toLowerCase();
//         vendorList = vendorList.filter(vendor =>
//           vendor.businessName.toLowerCase().includes(searchTerm) ||
//           vendor.description.toLowerCase().includes(searchTerm) ||
//           (vendor.services && vendor.services.some(service => service.name.toLowerCase().includes(searchTerm)))
//         );
//       }
//       return vendorList;
//     } catch (error) {
//       console.error('Error querying vendors:', error);
//       throw new Error('Failed to retrieve vendors.');
//     }
//   }

//   /**
//    * Recalculates and updates a vendor's average rating and total review count.
//    * @param {string} vendorId - The ID of the vendor.
//    * @returns {Promise<void>}
//    */
//   static async updateVendorRating(vendorId) {
//     try {
//       const reviewsSnapshot = await db.collection('reviews')
//         .where('vendorId', '==', vendorId)
//         .where('status', '==', 'approved') // Only count approved reviews
//         .get();

//       let totalRating = 0;
//       let totalReviews = 0;

//       reviewsSnapshot.forEach(doc => {
//         const review = doc.data();
//         totalRating += review.rating;
//         totalReviews++;
//       });

//       const averageRating = totalReviews > 0 ? (totalRating / totalReviews) : 0;

//       await db.collection('vendors').doc(vendorId).update({
//         averageRating: parseFloat(averageRating.toFixed(1)), // Store with one decimal place
//         totalReviews: totalReviews,
//         updatedAt: new Date(),
//       });
//       console.log(`Vendor ${vendorId} rating updated: Avg=${averageRating.toFixed(1)}, Total=${totalReviews}`);
//     } catch (error) {
//       console.error(`Error updating rating for vendor ${vendorId}:`, error);
//       // Don't re-throw, as it shouldn't block review submission
//     }
//   }
//   /**
//    * Increments the profileViews count for a vendor.
//    * @param {string} vendorId - The ID of the vendor.
//    * @returns {Promise<void>}
//    */
//   static async incrementProfileView(vendorId) {
//     try {
//       const vendorRef = db.collection('vendors').doc(vendorId);
//       await vendorRef.update({
//         profileViews: admin.firestore.FieldValue.increment(1),
//       });
//     } catch (error) {
//       console.error(`Error incrementing profile view for vendor ${vendorId}:`, error);
//       // Don't re-throw, as it's a non-critical background update
//     }
//   }

//   /**
//    * Increments the searchImpressions count for a vendor.
//    * @param {string} vendorId - The ID of the vendor.
//    * @returns {Promise<void>}
//    */
//   static async incrementSearchImpression(vendorId) {
//     try {
//       const vendorRef = db.collection('vendors').doc(vendorId);
//       await vendorRef.update({
//         searchImpressions: admin.firestore.FieldValue.increment(1),
//       });
//     } catch (error) {
//       console.error(`Error incrementing search impression for vendor ${vendorId}:`, error);
//       // Don't re-throw
//     }
//   }
// }

// module.exports = VendorModel;

// src/models/VendorModel.js
const { db, admin } = require('../config/firebaseAdmin'); // Ensure 'admin' is imported for FieldValue

class VendorModel {
  /**
   * Creates a new vendor document in Firestore.
   * @param {object} vendorData - The data for the new vendor.
   * @returns {Promise<object>} The created vendor document with its ID.
   */
  static async createVendor(vendorData) {
    // Ensure creation and update timestamps are set
    const newVendorData = {
      ...vendorData,
      createdAt: new Date(),
      updatedAt: new Date(),
      averageRating: 0, // Initialize
      totalReviews: 0,  // Initialize
      status: 'pending', // Default status for new registrations
      isOpen: true,      // Default to open
      profileViews: 0,
      searchImpressions: 0,
    };

    try {
      const docRef = await db.collection('vendors').add(newVendorData);
      return { id: docRef.id, ...newVendorData };
    } catch (error) {
      console.error('Error creating vendor in Firestore:', error);
      throw new Error('Failed to create vendor profile.');
    }
  }

  /**
   * Retrieves a vendor document by its ID.
   * @param {string} vendorId - The ID of the vendor document.
   * @returns {Promise<object|null>} The vendor document or null if not found.
   */
  static async getVendorById(vendorId) {
    try {
      const doc = await db.collection('vendors').doc(vendorId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting vendor by ID:', error);
      throw new Error('Failed to retrieve vendor profile.');
    }
  }

  /**
   * Retrieves a vendor document by its owner's Firebase UID.
   * This is the method to use for the /api/vendors/me endpoint.
   * @param {string} ownerUid - The Firebase UID of the vendor's owner.
   * @returns {Promise<object|null>} The vendor document or null if not found.
   */
  static async getVendorByOwnerId(ownerUid) {
    try {
      // Query the 'vendors' collection where 'userId' field matches the ownerUid
      const snapshot = await db.collection('vendors')
        .where('userId', '==', ownerUid) // 'userId' is the field storing the owner's UID
        .limit(1) // Assuming one vendor per user
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error fetching vendor by owner UID:', error);
      throw new Error('Failed to fetch vendor profile by owner.');
    }
  }


  /**
   * Updates an existing vendor document.
   * @param {string} vendorId - The ID of the vendor document to update.
   * @param {object} updates - The fields to update.
   * @returns {Promise<object>} The updated vendor document.
   */
  static async updateVendor(vendorId, updates) {
    try {
      const vendorRef = db.collection('vendors').doc(vendorId);
      await vendorRef.update({ ...updates, updatedAt: new Date() });
      const updatedDoc = await vendorRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw new Error('Failed to update vendor profile.');
    }
  }

  /**
   * Deletes a vendor document.
   * @param {string} vendorId - The ID of the vendor document to delete.
   * @returns {Promise<boolean>} True if deleted successfully.
   */
  static async deleteVendor(vendorId) {
    try {
      await db.collection('vendors').doc(vendorId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw new Error('Failed to delete vendor profile.');
    }
  }

  /**
   * Queries vendors based on various parameters.
   * @param {object} params - Query parameters.
   * @param {string} [params.category] - Filter by category.
   * @param {string} [params.search] - Search by business name or description (basic contains).
   * @param {string} [params.colony] - Filter by colony name.
   * @param {boolean} [params.isOpen] - Filter by operational status.
   * @param {string} [params.sortBy] - Field to sort by (e.g., 'averageRating', 'createdAt').
   * @param {string} [params.sortOrder] - 'asc' or 'desc'.
   * @returns {Promise<Array<object>>} List of matching vendor documents.
   */
  static async queryVendors(params = {}) {
    let vendorsRef = db.collection('vendors');
    let query = vendorsRef;

    // Apply filters
    if (params.category) {
      query = query.where('category', '==', params.category);
    }
    if (params.colony) {
      query = query.where('address.colony', '==', params.colony);
    }
    if (params.isOpen !== undefined) {
      query = query.where('isOpen', '==', params.isOpen);
    }
    // Only fetch approved vendors for public listings
    query = query.where('status', '==', 'approved');


    // Apply sorting
    const sortBy = params.sortBy || 'createdAt'; // Default sort
    const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc'; // Default asc

    if (sortBy === 'averageRating') {
      query = query.orderBy('averageRating', sortOrder);
    } else if (sortBy === 'createdAt') {
      query = query.orderBy('createdAt', sortOrder);
    } else if (sortBy === 'businessName') { // For alphabetical sorting
      query = query.orderBy('businessName', sortOrder);
    }


    try {
      const snapshot = await query.get();
      let vendorList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Basic search (in-memory filtering for 'contains' or multiple fields)
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        vendorList = vendorList.filter(vendor =>
          vendor.businessName.toLowerCase().includes(searchTerm) ||
          vendor.description.toLowerCase().includes(searchTerm) ||
          (vendor.services && vendor.services.some(service => service.name.toLowerCase().includes(searchTerm)))
        );
      }

      return vendorList;
    } catch (error) {
      console.error('Error querying vendors:', error);
      throw new Error('Failed to retrieve vendors.');
    }
  }

  /**
   * Retrieves all vendor documents, regardless of status (for admin panel).
   * @returns {Promise<Array<object>>} List of all vendor documents.
   */
  static async getAllVendorsAdmin() {
    try {
      const snapshot = await db.collection('vendors').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all vendors for admin:', error);
      throw new Error('Failed to retrieve all vendors.');
    }
  }

  /**
   * Updates the status of a vendor.
   * @param {string} vendorId - The ID of the vendor.
   * @param {string} newStatus - The new status ('pending', 'approved', 'suspended', 'rejected').
   * @returns {Promise<object>} The updated vendor document.
   */
  static async updateVendorStatus(vendorId, newStatus) {
    if (!['pending', 'approved', 'suspended', 'rejected'].includes(newStatus)) {
      throw new Error('Invalid vendor status provided.');
    }
    try {
      const vendorRef = db.collection('vendors').doc(vendorId);
      await vendorRef.update({ status: newStatus, updatedAt: new Date() });
      const updatedDoc = await vendorRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating vendor status:', error);
      throw new Error('Failed to update vendor status.');
    }
  }

  /**
   * Increments the profileViews count for a vendor.
   * @param {string} vendorId - The ID of the vendor.
   * @returns {Promise<void>}
   */
  static async incrementProfileView(vendorId) {
    try {
      const vendorRef = db.collection('vendors').doc(vendorId);
      await vendorRef.update({
        profileViews: admin.firestore.FieldValue.increment(1),
      });
    } catch (error) {
      console.error(`Error incrementing profile view for vendor ${vendorId}:`, error);
      // Don't re-throw, as it's a non-critical background update
    }
  }
   static async updateVendorRating(vendorId, newRating) {
    try {
      const vendorRef = db.collection('vendors').doc(vendorId);

      // Use a transaction to safely read and update the document
      const updatedVendor = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(vendorRef);

        if (!doc.exists) {
          throw new Error('Vendor not found when attempting to update rating.');
        }

        const data = doc.data();
        const currentAverageRating = data.averageRating || 0;
        const currentTotalReviews = data.totalReviews || 0;

        // Calculate new average rating
        const newTotalReviews = currentTotalReviews + 1;
        const newSumOfRatings = (currentAverageRating * currentTotalReviews) + newRating;
        const newAverageRating = newSumOfRatings / newTotalReviews;

        // Update the vendor document within the transaction
        transaction.update(vendorRef, {
          averageRating: newAverageRating,
          totalReviews: newTotalReviews,
          updatedAt: new Date(),
        });

        // Return the updated data (or a representation of it)
        return {
          id: doc.id,
          ...data,
          averageRating: newAverageRating,
          totalReviews: newTotalReviews,
          updatedAt: new Date(),
        };
      });

      return updatedVendor;

    } catch (error) {
      console.error(`Error updating vendor rating for ${vendorId}:`, error);
      throw new Error('Failed to update vendor rating.');
    }
  }

  /**
   * Increments the searchImpressions count for a vendor.
   * @param {string} vendorId - The ID of the vendor.
   * @returns {Promise<void>}
   */
  static async incrementSearchImpression(vendorId) {
    try {
      const vendorRef = db.collection('vendors').doc(vendorId);
      await vendorRef.update({
        searchImpressions: admin.firestore.FieldValue.increment(1),
      });
    } catch (error) {
      console.error(`Error incrementing search impression for vendor ${vendorId}:`, error);
      // Don't re-throw
    }
    
  }
}

module.exports = VendorModel;