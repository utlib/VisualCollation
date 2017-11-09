import {
  login,
  register,
  confirm,
  logout,
  resetPasswordRequest,
  resetPassword,
  updateProfile,
  deleteProfile
} from '../../src/actions/userActions';


describe('>>>A C T I O N --- Test userActions', () => {
  it('+++ actionCreator login', () => {
    const session = {
      session: {
        email: "user@mail.com",
        password: "secret"
      }
    };
    const loginAction = login(session);
    expect(loginAction).toEqual({
      types: ['NO_LOADING','LOGIN_SUCCESS','LOGIN_FAILED'],
      payload: {
        request : {
          url: `/session`,
          method: 'post',
          data: { session },
          successMessage: "You have successfully logged in" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    })
  });

  it('+++ actionCreator register', () => {
    const user = {
      email: "user@mail.com",
      password: "secret",
      name: "user"
    };
    const registerAction = register(user);
    expect(registerAction).toEqual({
      types: ['NO_LOADING','REGISTER_SUCCESS','REGISTER_FAILED'],
      payload: {
        request : {
          url: `/registration`,
          method: 'post',
          data: {user},
          successMessage: "You have successfully registered" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    })
  });

  it('+++ actionCreator confirm', () => {
    const confirmation_token = {
      confirmation_token: "5951303fc9bf3c7b9a573a3f"
    };
    const confirmAction = confirm(confirmation_token);
    expect(confirmAction).toEqual({
      types: ['NO_LOADING','CONFIRM_SUCCESS','CONFIRM_FAILED'],
      payload: {
        request : {
          url: `/confirmation`,
          method: 'put',
          data: { confirmation_token },
          successMessage: "You have successfully confirmed your account" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    })
  });

  it('+++ actionCreator logout', () => {
    const logoutAction = logout();
    expect(logoutAction).toEqual({
      types: ['NO_LOADING','LOGOUT_SUCCESS','LOGOUT_FAILED'],
      payload: {
        request : {
          url: `/session`,
          method: 'delete',
          successMessage: "You have successfully logged out" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    })
  });

  it('+++ actionCreator resetPasswordRequest', () => {
    const email = "user@mail.com";
    const resetPasswordRequestAction = resetPasswordRequest(email)
    expect(resetPasswordRequestAction).toEqual({
      types: ['NO_LOADING','REQUEST_RESET_SUCCESS','REQUEST_RESET_FAILED'],
      payload: {
        request : {
          url: `/password`,
          method: 'post',
          data: {password: { email }},
          successMessage: "You have successfully requested to reset password" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    })
  });

  it('+++ actionCreator resetPassword', () => {
    const password = {
      psasword: "secret",
      password_confirmation: "secret"
    };
    const reset_password_token = "5951303fc9bf3c7b9a573a3f";
    const resetPasswordAction = resetPassword(reset_password_token, password);
    expect(resetPasswordAction).toEqual({
      types: ['NO_LOADING','RESET_SUCCESS','RESET_FAILED'],
      payload: {
        request : {
          url: `/password`,
          method: 'put',
          data: {reset_password_token, password},
          successMessage: "You have successfully reset your password" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    })
  });

  it('+++ actionCreator updateProfile', () => {
    const user = {user: {id: "123", name: "batman"}};
    const userID = "123456";
    const updateProfileAction = updateProfile(user, userID);
    expect(updateProfileAction).toEqual({
      types: ['SHOW_LOADING','UPDATE_PROFILE_SUCCESS','UPDATE_PROFILE_FAILED'],
      payload: {
        request : {
          url: `/users/${userID}`,
          method: 'put',
          data: user,
          successMessage: "You have successfully updated your account" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    })
  });

  it('+++ actionCreator deleteProfile', () => {
    const userID = "123456";
    const deleteProfileAction = deleteProfile(userID);
    expect(deleteProfileAction).toEqual({
      types: ['SHOW_LOADING','DELETE_PROFILE_SUCCESS','DELETE_PROFILE_FAILED'],
      payload: {
        request : {
          url: `/users/${userID}`,
          method: 'delete',
          successMessage: "You have successfully deleted your account" ,
          errorMessage: "Ooops! Something went wrong"
        }
      }
    })
  });

});
