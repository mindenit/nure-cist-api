export interface IJwtPayload {
    id: number,
}

export interface IJwt {
    access_token: string,
    refresh_token: string,
}

export interface IRegisterPayload {
    email: string,
    password: string,
}

