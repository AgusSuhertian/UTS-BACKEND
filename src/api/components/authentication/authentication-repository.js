const { User } = require('../../../models');

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

// fungsi ini digunakan untuk menghitung berapa banyak gagal login yang dilakukan
async function loginAttempt(email, attempt) {
  let now = new Date();
  return User.updateOne(
    {
      email: email,
    },
    {
      $set: {
        updatedOn: now,
        attempt: attempt,
      },
    }
  );
}

// fungsi ini digunakan untuk mereset attempt (gagal login) jika login sukses dilakukan
async function loginSuccess(email) {
  return User.updateOne(
    {
      email: email,
    },
    {
      $set: {
        attempt: 0,
      },
    }
  );
}

// fungsi ini digunakan untuk mereset attempt (gagal login) jika gagal login sudah 5x dan sudah menunggu 30 menit
async function resetAttempt(email) {
  return User.updateOne(
    {
      email: email,
    },
    {
      $set: {
        attempt: 0,
      },
    }
  );
}
module.exports = {
  getUserByEmail,
  loginAttempt,
  loginSuccess,
  resetAttempt,
};
