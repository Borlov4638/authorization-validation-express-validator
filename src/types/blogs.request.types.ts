import { Request } from "express";

export type RequestWithParam<P> = Request<P,{},{},{}>

export type RequestWithBody<B> = Request<{},{},B,{}>

export type RequestWithParamAndBody<P,B> = Request<P,{},B,{}>