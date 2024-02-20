import { UserDto } from '../dto/user.dto'

export type JWTToken = UserDto & {
  access_token: string
}
