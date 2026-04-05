export interface PaginationInput {
  page?: number
  pageSize?: number
}

export interface PaginationResult {
  page: number
  pageSize: number
  from: number
  to: number
}

export interface PaginatedResult<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 50

export function normalizePagination(input: PaginationInput = {}): PaginationResult {
  const page = Number.isFinite(input.page) ? Math.max(DEFAULT_PAGE, Math.trunc(input.page as number)) : DEFAULT_PAGE
  const pageSize = Number.isFinite(input.pageSize)
    ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.trunc(input.pageSize as number)))
    : DEFAULT_PAGE_SIZE

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  return { page, pageSize, from, to }
}

export function toPaginatedResult<T>(data: T[], total: number, page: number, pageSize: number): PaginatedResult<T> {
  const safeTotal = Math.max(0, total)
  return {
    data,
    total: safeTotal,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(safeTotal / pageSize)),
  }
}

export function asTrimmedNullable(value: string | null | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

export function asTrimmedRequired(value: string | null | undefined, fieldName: string) {
  const normalized = value?.trim()

  if (!normalized) {
    throw new Error(`${fieldName} is required.`)
  }

  return normalized
}

export function asPositiveAmount(value: number, fieldName: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${fieldName} must be a valid positive amount.`)
  }

  return Number(value.toFixed(2))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}
