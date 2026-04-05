import { canAccessProject, createProject, listProjects, updateProject } from "@/lib/projects/repository"
import type { ProjectFilters, ProjectMutationInput } from "@/lib/projects/types"
import { validateProjectInput } from "@/lib/projects/validation"

export async function getProjects(filters: ProjectFilters = {}) {
  return listProjects(filters)
}

export async function saveProjectRecord(input: ProjectMutationInput, projectId?: string | null) {
  const payload = validateProjectInput(input)
  return projectId ? updateProject(projectId, payload) : createProject(payload)
}

export async function updateProjectAccess(projectId: string, accessBlocked: boolean) {
  return updateProject(projectId, { access_blocked: accessBlocked })
}

export async function changeProjectStatus(projectId: string, status: ProjectMutationInput["status"]) {
  return updateProject(projectId, { status })
}

export async function assertProjectAccessAllowed(projectId: string) {
  const allowed = await canAccessProject(projectId)

  if (!allowed) {
    throw new Error("Project access is blocked because its subscription is not active.")
  }

  return true
}
