/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */

import {
  t_GetRepositoryScansParamSchema,
  t_RepositoryScan,
} from "@/generated/models"
import {
  KoaRuntimeError,
  RequestInputType,
} from "@nahkies/typescript-koa-runtime/errors"
import {
  KoaRuntimeResponder,
  KoaRuntimeResponse,
  StatusCode,
} from "@nahkies/typescript-koa-runtime/server"
import {Params, parseRequestInput} from "@nahkies/typescript-koa-runtime/zod"
import {NextRequest} from "next/server"
import {z} from "zod"

export type GetRepositoryScansResponder = {
  with200(): KoaRuntimeResponse<t_RepositoryScan[]>
} & KoaRuntimeResponder

export type GetRepositoryScans = (
  params: Params<t_GetRepositoryScansParamSchema, void, void>,
  respond: GetRepositoryScansResponder,
  ctx: {request: NextRequest},
) => Promise<KoaRuntimeResponse<unknown>>

const getRepositoryScansParamSchema = z.object({repositoryId: z.string()})

export const _GET =
  (implementation: GetRepositoryScans) =>
  async (
    request: NextRequest,
    {params}: {params: unknown},
  ): Promise<Response> => {
    const input = {
      params: parseRequestInput(
        getRepositoryScansParamSchema,
        params,
        RequestInputType.RouteParam,
      ),
      // TODO: this swallows repeated parameters
      query: undefined,
      body: undefined,
    }

    const responder = {
      with200() {
        return new KoaRuntimeResponse<t_RepositoryScan[]>(200)
      },
      withStatus(status: StatusCode) {
        return new KoaRuntimeResponse(status)
      },
    }

    const {status, body} = await implementation(input, responder, {request})
      .then((it) => it.unpack())
      .catch((err) => {
        throw KoaRuntimeError.HandlerError(err)
      })

    return body !== undefined
      ? Response.json(body, {status})
      : new Response(undefined, {status})
  }