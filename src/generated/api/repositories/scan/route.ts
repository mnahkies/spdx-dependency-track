/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */

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
import {t_ScanRepositoriesBodySchema} from "../../../models"
import {s_scanRepositoriesJsonRequestBody} from "../../../schemas"

export type ScanRepositoriesResponder = {
  with204(): KoaRuntimeResponse<void>
} & KoaRuntimeResponder

export type ScanRepositories = (
  params: Params<void, void, t_ScanRepositoriesBodySchema>,
  respond: ScanRepositoriesResponder,
  ctx: {request: NextRequest},
) => Promise<KoaRuntimeResponse<unknown>>

const scanRepositoriesBodySchema = s_scanRepositoriesJsonRequestBody

export const _POST =
  (implementation: ScanRepositories) =>
  async (
    request: NextRequest,
    {params}: {params: unknown},
  ): Promise<Response> => {
    const input = {
      params: undefined,
      // TODO: this swallows repeated parameters
      query: undefined,
      body: parseRequestInput(
        scanRepositoriesBodySchema,
        await request.json(),
        RequestInputType.RequestBody,
      ),
    }

    const responder = {
      with204() {
        return new KoaRuntimeResponse<void>(204)
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

    return Response.json(body, {status})
  }