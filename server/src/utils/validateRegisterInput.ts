import { RegisterInput } from '../types/users/RegisterInput'

export const validateRegisterInput = (registerInput: RegisterInput) => {
  if (!registerInput.email.includes('@'))
    return {
      message: 'Email không đúng định dạng',
      errors: [{ field: 'email', message: 'Email không đúng định dạng' }]
    }

  if (registerInput.username.length <= 2)
    return {
      message: 'Tên không đúng',
      errors: [
        {
          field: 'username',
          message: 'Tên đã nhập bắt buộc phải trên 2 kí tự'
        }
      ]
    }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(registerInput.username))
    return {
      message: 'Invalid username',
      errors: [
        { field: 'username', message: `Tên không được chứa kí tự đặc biệt` }
      ]
    }

  if (registerInput.password.length < 2)
    return {
      message: 'Invalid password',
      errors: [
        {
          field: 'password',
          message: 'Password nhập phải trên 2 kí tự'
        }
      ]
    }

  return null
}
