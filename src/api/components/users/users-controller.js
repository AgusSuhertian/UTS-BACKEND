const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    // Mengindentifikasi paramter" yang akan digunakan
    let pageNumber = parseInt(request.query.page_number) || 1;
    let pageSize = parseInt(request.query.page_size) || null;
    const searchField = request.query.search
      ? isValidSearchField(request.query.search.split(':')[0])
      : null;
    const searchKey = request.query.search
      ? request.query.search.split(':')[1]
      : null;
    const sortField = request.query.sort
      ? isValidSortField(request.query.sort.split(':')[0])
      : 'email';
    const sortOrder = request.query.sort
      ? isValidSortOrder(request.query.sort.split(':')[1])
      : 'asc';

    let filteredUsers = null;
    if (pageSize) {
      filteredUsers = await usersService.getUsers(
        pageNumber,
        pageSize,
        searchField,
        searchKey,
        sortField,
        sortOrder
      );
    } else {
      // logic ini jika page number dan page size tidak diberikan maka akan menampilkan semua data
      filteredUsers = await usersService.getUsers();
    }

    // Untuk mengsortir data sesuai dengan yang diminta
    const sortedUsers = filteredUsers.sort((a, b) => {
      return sortOrder === 'asc'
        ? a[sortField].localeCompare(b[sortField])
        : b[sortField].localeCompare(a[sortField]);
    });

    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = pageSize ? startIndex + pageSize : sortedUsers.length;

    // Menampilkan data page ini
    const usersForPage = sortedUsers.slice(startIndex, endIndex);

    // untuk mengitung jumlah page
    const totalUsers = filteredUsers.length;
    const totalPages = pageSize ? Math.ceil(totalUsers / pageSize) : 1;

    // mengidentifikasi jika ada page selanjut nya atau sebelumnya
    const hasPreviousPage = pageNumber > 1;
    const hasNextPage = pageSize ? endIndex < totalUsers : false;

    // struktur data yang akan ditampilkan
    const responseData = {
      page_number: pageNumber,
      page_size: pageSize,
      count: filteredUsers.length,
      total_pages: totalPages,
      has_previous_page: hasPreviousPage,
      has_next_page: hasNextPage,
      users: usersForPage,
    };

    return response.status(200).json(responseData);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}

// fungsi untuk mengidentifikasi sort ingin sesuai nama atau  email jika tidak ada masukan maka defaulnya adalah email
function isValidSortField(field) {
  if (['email', 'name'].includes(field)) {
    return field;
  }
  return 'email';
}
// fungsi untuk mengidentifikasi sort ingin asc atau desc jika tidak ada masukan maka defaulnya adalah asc

function isValidSortOrder(order) {
  if (['asc', 'desc'].includes(order)) {
    return order;
  }
  return 'asc';
}

// fungsi untuk mengidentifikasi field box search, jika dalam field box search tidak ada masukan maka fungsi ini tidak berguna
function isValidSearchField(field) {
  if (['email', 'name'].includes(field)) {
    return field;
  }
  return null;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};
