import {isDefined} from "@/lib/utils"
import {describe, expect, it} from "@jest/globals"

describe("lib/utils", () => {
  describe("isDefined", () => {
    it("returns true for defined values", () => {
      expect(isDefined("test")).toBe(true)
    })
    it("returns false for undefined values", () => {
      expect(isDefined(undefined)).toBe(false)
    })
  })
})
