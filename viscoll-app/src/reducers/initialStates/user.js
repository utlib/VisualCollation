export const initialState = {
  authenticated: false,
  token: "",
  errors: {
    login: {errorMessage: ""},
    register: {email: "", password: ""},
    update: {password: "", current_password: "", email: ""},
    confirmation: "",
  }
}

export default initialState;
