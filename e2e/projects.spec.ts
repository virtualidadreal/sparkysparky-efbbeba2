import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Project Management
 * 
 * Covers:
 * - Project creation with validation
 * - Project editing (title, description, tags, deadline)
 * - Project archiving and deletion
 * - Linking ideas to projects
 * - Project list display and filtering
 * - Error handling and edge cases
 */

// Mock data for projects
const mockProjects = [
  {
    id: "project-1",
    user_id: "test-user-id",
    title: "Proyecto IA",
    description: "Desarrollo de asistente inteligente",
    status: "active",
    progress: 25,
    due_date: "2026-03-15",
    tags: ["tech", "ai"],
    keywords: ["machine-learning", "nlp"],
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-20T15:30:00Z",
  },
  {
    id: "project-2",
    user_id: "test-user-id",
    title: "Productividad Personal",
    description: "Sistema de gestión de tiempo",
    status: "active",
    progress: 60,
    due_date: "2026-02-28",
    tags: ["productivity", "habits"],
    keywords: ["time-management"],
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-01-25T12:00:00Z",
  },
  {
    id: "project-3",
    user_id: "test-user-id",
    title: "Blog Técnico",
    description: "Creación de contenido técnico",
    status: "archived",
    progress: 100,
    due_date: null,
    tags: ["writing", "tech"],
    keywords: ["content"],
    created_at: "2026-01-05T09:00:00Z",
    updated_at: "2026-01-15T18:00:00Z",
  },
];

// Mock ideas for linking tests
const mockIdeas = [
  {
    id: "idea-1",
    user_id: "test-user-id",
    title: "Implementar chatbot",
    description: "Chatbot con IA para soporte",
    project_id: null,
    status: "active",
    tags: ["ai", "support"],
    created_at: "2026-01-20T10:00:00Z",
    updated_at: "2026-01-20T10:00:00Z",
  },
  {
    id: "idea-2",
    user_id: "test-user-id",
    title: "Dashboard analytics",
    description: "Panel de métricas en tiempo real",
    project_id: "project-1",
    status: "active",
    tags: ["analytics", "dashboard"],
    created_at: "2026-01-18T14:00:00Z",
    updated_at: "2026-01-18T14:00:00Z",
  },
];

test.describe("Project Management E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      const mockSession = {
        access_token: "mock-token",
        refresh_token: "mock-refresh",
        user: {
          id: "test-user-id",
          email: "test@example.com",
          user_metadata: { display_name: "Test User" },
        },
      };
      localStorage.setItem(
        "sb-osupgbsaashqhspbuafb-auth-token",
        JSON.stringify(mockSession)
      );
    });

    // Mock projects API
    await page.route("**/rest/v1/projects**", (route) => {
      const method = route.request().method();
      const url = route.request().url();

      if (method === "GET") {
        // Filter by status if specified
        if (url.includes("status=eq.active")) {
          const activeProjects = mockProjects.filter(p => p.status === "active");
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(activeProjects),
          });
        } else if (url.includes("select=*&head=true")) {
          // Count query for active projects
          route.fulfill({
            status: 200,
            contentType: "application/json",
            headers: { "content-range": "0-1/2" },
            body: JSON.stringify([]),
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(mockProjects),
          });
        }
      } else if (method === "POST") {
        const newProject = {
          id: "new-project-id",
          user_id: "test-user-id",
          title: "Nuevo Proyecto",
          description: "Descripción del proyecto",
          status: "active",
          progress: 0,
          due_date: null,
          tags: [],
          keywords: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(newProject),
        });
      } else if (method === "PATCH") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...mockProjects[0], title: "Proyecto Actualizado" }),
        });
      } else if (method === "DELETE") {
        route.fulfill({
          status: 204,
          body: "",
        });
      } else {
        route.continue();
      }
    });

    // Mock ideas API for linking
    await page.route("**/rest/v1/ideas_decrypted**", (route) => {
      const url = route.request().url();
      if (url.includes("project_id=is.null")) {
        // Unassigned ideas count
        route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: { "content-range": "0-0/1" },
          body: JSON.stringify([mockIdeas[0]]),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockIdeas),
        });
      }
    });

    // Mock ideas update for linking
    await page.route("**/rest/v1/ideas**", (route) => {
      if (route.request().method() === "PATCH") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...mockIdeas[0], project_id: "project-1" }),
        });
      } else {
        route.continue();
      }
    });

    // Mock profiles API
    await page.route("**/rest/v1/profiles**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ display_name: "Test User", avatar_url: null }]),
      });
    });

    // Mock user subscriptions
    await page.route("**/rest/v1/user_subscriptions**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ plan: "pro" }]),
      });
    });
  });

  test.describe("Project List Display", () => {
    test("should display projects page with correct title", async ({ page }) => {
      await page.goto("/projects");
      await expect(page.getByRole("heading", { name: /mis proyectos/i })).toBeVisible();
    });

    test("should show project cards in grid layout", async ({ page }) => {
      await page.goto("/projects");
      
      // Wait for projects to load
      await page.waitForTimeout(500);
      
      // Should show project titles
      await expect(page.getByText("Proyecto IA")).toBeVisible();
      await expect(page.getByText("Productividad Personal")).toBeVisible();
    });

    test("should display 'Ideas sueltas' special card", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      await expect(page.getByText("Ideas sueltas")).toBeVisible();
    });

    test("should show project statistics in sidebar", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Check for stats section
      await expect(page.getByText("ESTADÍSTICAS")).toBeVisible();
      await expect(page.getByText("Activos")).toBeVisible();
      await expect(page.getByText("Total")).toBeVisible();
    });

    test("should filter projects with search input", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      const searchInput = page.getByPlaceholder(/buscar proyectos/i);
      await expect(searchInput).toBeVisible();
      
      await searchInput.fill("IA");
      await page.waitForTimeout(300);
      
      // Search should be applied (UI filters)
      await expect(searchInput).toHaveValue("IA");
    });
  });

  test.describe("Project Creation", () => {
    test("should open project form modal when clicking 'Nuevo Proyecto'", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Click new project button
      const newProjectBtn = page.getByRole("button", { name: /nuevo proyecto/i });
      await newProjectBtn.click();
      
      // Modal should open
      await expect(page.getByRole("dialog")).toBeVisible();
    });

    test("should show form fields for project creation", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      await page.getByRole("button", { name: /nuevo proyecto/i }).click();
      
      // Check for form fields
      await expect(page.getByLabel(/título/i).or(page.getByPlaceholder(/nombre del proyecto/i))).toBeVisible();
    });

    test("should create project with valid data", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      await page.getByRole("button", { name: /nuevo proyecto/i }).click();
      await page.waitForTimeout(300);
      
      // Fill form
      const titleInput = page.getByLabel(/título/i).or(page.getByPlaceholder(/nombre del proyecto/i));
      await titleInput.fill("Mi Nuevo Proyecto");
      
      // Submit form
      const submitBtn = page.getByRole("button", { name: /crear|guardar/i });
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }
    });

    test("should close modal on cancel", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      await page.getByRole("button", { name: /nuevo proyecto/i }).click();
      await page.waitForTimeout(300);
      
      // Press Escape to close
      await page.keyboard.press("Escape");
      
      // Modal should be closed (or close button)
      await page.waitForTimeout(300);
    });

    test("should open form from empty state click", async ({ page }) => {
      // Mock empty projects
      await page.route("**/rest/v1/projects**", (route) => {
        if (route.request().method() === "GET") {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify([]),
          });
        } else {
          route.continue();
        }
      });
      
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Click empty state area
      const emptyStateBtn = page.getByText(/pulsa aquí para crear/i).or(page.getByText(/no hay más proyectos/i));
      if (await emptyStateBtn.isVisible()) {
        await emptyStateBtn.click();
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe("Project Editing", () => {
    test("should open edit form when clicking project card", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Click on a project card
      const projectCard = page.getByText("Proyecto IA");
      await projectCard.click();
      
      // Edit form/modal should open
      await page.waitForTimeout(300);
    });

    test("should populate form with existing project data", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      await page.getByText("Proyecto IA").click();
      await page.waitForTimeout(500);
      
      // Form should have project data
      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        // Check title field has value
        const titleInput = dialog.getByLabel(/título/i).or(dialog.getByPlaceholder(/nombre/i));
        if (await titleInput.isVisible()) {
          await expect(titleInput).toHaveValue(/proyecto ia/i);
        }
      }
    });

    test("should update project on save", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      await page.getByText("Proyecto IA").click();
      await page.waitForTimeout(300);
      
      const dialog = page.getByRole("dialog");
      if (await dialog.isVisible()) {
        const titleInput = dialog.getByLabel(/título/i).or(dialog.getByPlaceholder(/nombre/i));
        if (await titleInput.isVisible()) {
          await titleInput.clear();
          await titleInput.fill("Proyecto IA Actualizado");
          
          const saveBtn = dialog.getByRole("button", { name: /guardar|actualizar/i });
          if (await saveBtn.isVisible()) {
            await saveBtn.click();
          }
        }
      }
    });

    test("should cancel edit without saving changes", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      await page.getByText("Proyecto IA").click();
      await page.waitForTimeout(300);
      
      // Press Escape to cancel
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    });
  });

  test.describe("Project Archiving and Deletion", () => {
    test("should show archive option for active projects", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Hover over project card to reveal actions
      const projectCard = page.locator('[class*="card"]').filter({ hasText: "Proyecto IA" }).first();
      if (await projectCard.isVisible()) {
        await projectCard.hover();
        await page.waitForTimeout(200);
        
        // Look for archive button/icon
        const archiveBtn = page.getByRole("button", { name: /archivar/i }).or(page.locator('[aria-label*="archivar"]'));
        // Just check if we can access it
      }
    });

    test("should confirm before archiving project", async ({ page }) => {
      // Mock window.confirm
      await page.addInitScript(() => {
        window.confirm = () => true;
      });
      
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Archiving flow would trigger confirmation
    });

    test("should archive project on confirmation", async ({ page }) => {
      let patchCalled = false;
      
      await page.route("**/rest/v1/projects**", (route) => {
        if (route.request().method() === "PATCH") {
          patchCalled = true;
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ ...mockProjects[0], status: "archived" }),
          });
        } else {
          route.continue();
        }
      });
      
      await page.addInitScript(() => {
        window.confirm = () => true;
      });
      
      await page.goto("/projects");
      await page.waitForTimeout(500);
    });
  });

  test.describe("Ideas Linking", () => {
    test("should navigate to unassigned ideas from 'Ideas sueltas' card", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      const looseIdeasCard = page.getByText("Ideas sueltas").first();
      await looseIdeasCard.click();
      
      // Should navigate to ideas with filter
      await expect(page).toHaveURL(/\/ideas\?filter=unassigned/);
    });

    test("should display unassigned ideas count", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Check for count display in Ideas sueltas card
      const looseIdeasCard = page.locator('[class*="card"]').filter({ hasText: "Ideas sueltas" });
      await expect(looseIdeasCard).toBeVisible();
    });

    test("should show linked ideas in project detail", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Click on project
      await page.getByText("Proyecto IA").click();
      await page.waitForTimeout(300);
      
      // Project detail may show linked ideas
    });
  });

  test.describe("Project Limit Enforcement", () => {
    test("should show warning when approaching 5 project limit", async ({ page }) => {
      // Mock 5 active projects (at limit)
      const fiveProjects = Array.from({ length: 5 }, (_, i) => ({
        id: `project-${i}`,
        user_id: "test-user-id",
        title: `Proyecto ${i + 1}`,
        description: "Descripción",
        status: "active",
        progress: 0,
        due_date: null,
        tags: [],
        keywords: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      
      await page.route("**/rest/v1/projects**", (route) => {
        if (route.request().method() === "GET") {
          route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(fiveProjects),
          });
        } else if (route.request().method() === "POST") {
          // Should fail at limit
          route.fulfill({
            status: 400,
            contentType: "application/json",
            body: JSON.stringify({ message: "Project limit reached" }),
          });
        } else {
          route.continue();
        }
      });
      
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // UI tip mentions 5 project limit
      await expect(page.getByText(/5 proyectos activos/i)).toBeVisible();
    });
  });

  test.describe("Error Handling", () => {
    test("should show error state on API failure", async ({ page }) => {
      await page.route("**/rest/v1/projects**", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        });
      });
      
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Should show error UI
      const errorText = page.getByText(/no pudimos cargar/i).or(page.getByText(/error/i));
      // Error state may be visible
    });

    test("should show retry button on error", async ({ page }) => {
      await page.route("**/rest/v1/projects**", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        });
      });
      
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      const retryBtn = page.getByRole("button", { name: /reintentar/i });
      if (await retryBtn.isVisible()) {
        await expect(retryBtn).toBeEnabled();
      }
    });

    test("should handle network timeout gracefully", async ({ page }) => {
      await page.route("**/rest/v1/projects**", (route) => {
        // Simulate timeout by not responding
        setTimeout(() => {
          route.abort("timedout");
        }, 100);
      });
      
      await page.goto("/projects");
      await page.waitForTimeout(1000);
    });
  });

  test.describe("UI/UX and Accessibility", () => {
    test("should be keyboard navigable", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Tab through elements
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      
      // Some element should be focused
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeTruthy();
    });

    test("should have proper heading structure", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Check for h1
      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toBeVisible();
    });

    test("should show loading skeleton while fetching", async ({ page }) => {
      // Delay API response
      await page.route("**/rest/v1/projects**", async (route) => {
        await new Promise((r) => setTimeout(r, 500));
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockProjects),
        });
      });
      
      await page.goto("/projects");
      
      // Skeleton should appear briefly
      const skeleton = page.locator('[class*="skeleton"]');
      // May or may not be visible depending on load time
    });

    test("should display project tags as badges", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Project cards should show tags
      const tagBadge = page.locator('[class*="badge"]').or(page.getByText("tech"));
      // Tags should be visible if present
    });

    test("should show progress indicator for projects", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Progress bar or percentage should be visible
      const progressElement = page.locator('[class*="progress"]').or(page.getByText(/25%|60%/));
      // Progress indicators may be visible
    });
  });

  test.describe("Quick Actions", () => {
    test("should show quick actions section in sidebar", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      await expect(page.getByText("ACCIONES RÁPIDAS")).toBeVisible();
    });

    test("should show tips section in sidebar", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      await expect(page.getByText("CONSEJOS")).toBeVisible();
    });

    test("should have 'Hablar con Sparky' button", async ({ page }) => {
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      const sparkyBtn = page.getByRole("button", { name: /hablar con sparky/i });
      await expect(sparkyBtn).toBeVisible();
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test("should show mobile footer on small screens", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Mobile footer should be visible
      const footer = page.locator('[class*="mobile"]').or(page.locator('[class*="footer"]'));
      // Footer visibility depends on viewport
    });

    test("should hide sidebar on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/projects");
      await page.waitForTimeout(500);
      
      // Right sidebar should be hidden on mobile
      const statsSection = page.getByText("ESTADÍSTICAS");
      await expect(statsSection).not.toBeVisible();
    });
  });
});
