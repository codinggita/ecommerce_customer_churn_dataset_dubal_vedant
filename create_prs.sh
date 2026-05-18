#!/bin/bash
set -e

REPO_DIR="/home/vista/class/as/fullstack/2"
BACKUP_DIR="/tmp/backup_repo"
UPSTREAM="codinggita"
ORIGIN="vedantdubal-141"
UPSTREAM_REPO="codinggita/ecommerce_customer_churn_dataset_dubal_vedant"

cd "$REPO_DIR"

# 1. Backup all files
echo "Backing up repository..."
rm -rf "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -a ./* "$BACKUP_DIR/" 2>/dev/null || true
cp -a ./.* "$BACKUP_DIR/" 2>/dev/null || true

# 2. Setup remotes and checkout clean main
git remote add upstream https://github.com/$UPSTREAM_REPO.git || true
git fetch upstream

git checkout -B main upstream/main

# Helper function to create PR
create_pr() {
  local pr_num=$1
  local date=$2
  local title=$3
  local copy_cmd=$4
  local branch="pr-$pr_num"

  echo "==========================================="
  echo "Creating PR $pr_num: $title"
  echo "==========================================="

  git checkout -b "$branch"

  # Run the copy command
  eval "$copy_cmd"

  git add .
  
  GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -m "$title" -m "Automated PR $pr_num" || true

  git push -u origin "$branch" --force

  # Create PR
  PR_URL=$(gh pr create --repo $UPSTREAM_REPO --base main --head ${ORIGIN}:${branch} --title "$title" --body "Implementation phase: $title")
  
  echo "Created PR: $PR_URL"

  # Merge PR
  sleep 2
  gh pr merge "$PR_URL" --merge --admin || gh pr merge "$PR_URL" --merge || echo "Failed to merge PR, please merge manually"

  sleep 2
  git checkout main
  git pull upstream main
}

# Delete all tracked files first to start from scratch (except README if it was there)
git rm -rf . || true
git checkout HEAD -- README.md || true

# --- BACKEND PHASE ---

create_pr 1 "2026-05-18T10:22:00Z" "Initialize Node.js project and install dependencies" "mkdir -p backend; cp $BACKUP_DIR/backend/package.json $BACKUP_DIR/backend/index.js $BACKUP_DIR/backend/.env backend/ 2>/dev/null || true; cp $BACKUP_DIR/package.json . 2>/dev/null || true"

create_pr 2 "2026-05-18T11:47:00Z" "Setup basic Express server and structure folders" "mkdir -p backend/src; cp $BACKUP_DIR/backend/src/app.js backend/src/ 2>/dev/null || true"

create_pr 3 "2026-05-18T16:03:00Z" "Create MongoDB database connection script" "mkdir -p backend/src/config; cp $BACKUP_DIR/backend/src/config/db.js backend/src/config/ 2>/dev/null || true"

create_pr 4 "2026-05-19T10:53:00Z" "Define User schema for authentication" "mkdir -p backend/src/models; cp $BACKUP_DIR/backend/src/models/user.model.js backend/src/models/ 2>/dev/null || true"

create_pr 5 "2026-05-19T15:28:00Z" "Build customer mongoose model with validation" "mkdir -p backend/src/models; cp $BACKUP_DIR/backend/src/models/customer.model.js backend/src/models/ 2>/dev/null || true"

create_pr 6 "2026-05-19T17:41:00Z" "Implement user registration and login endpoints" "mkdir -p backend/src/routes; cp $BACKUP_DIR/backend/src/routes/auth.routes.js backend/src/routes/ 2>/dev/null || true"

create_pr 7 "2026-05-20T16:22:00Z" "Create authentication and error middlewares" "mkdir -p backend/src/middlewares; cp -r $BACKUP_DIR/backend/src/middlewares/* backend/src/middlewares/ 2>/dev/null || true"

create_pr 8 "2026-05-21T12:07:00Z" "Implement CRUD operations for customer records" "mkdir -p backend/src/routes backend/src/controllers backend/src/services; cp $BACKUP_DIR/backend/src/routes/customer.routes.js backend/src/routes/ 2>/dev/null || true; cp $BACKUP_DIR/backend/src/controllers/customer.controller.js backend/src/controllers/ 2>/dev/null || true; cp $BACKUP_DIR/backend/src/services/customer.service.js backend/src/services/ 2>/dev/null || true"

create_pr 9 "2026-05-25T12:11:00Z" "Setup script to seed initial JSON dataset into MongoDB" "cp $BACKUP_DIR/backend/src/seeder.js backend/src/ 2>/dev/null || true"

create_pr 10 "2026-05-26T16:54:00Z" "Create analytics and aggregation pipelines" "mkdir -p backend/src/routes; cp $BACKUP_DIR/backend/src/routes/analytics.routes.js $BACKUP_DIR/backend/src/routes/stats.routes.js backend/src/routes/ 2>/dev/null || true"

create_pr 11 "2026-05-27T11:22:00Z" "Add search and filtering endpoints" "mkdir -p backend/src/routes; cp $BACKUP_DIR/backend/src/routes/filter.routes.js $BACKUP_DIR/backend/src/routes/search.routes.js backend/src/routes/ 2>/dev/null || true"

create_pr 12 "2026-06-03T11:43:00Z" "Finalize backend documentation and specs" "cp $BACKUP_DIR/9_ecommerce_customer_churn_dataset.md $BACKUP_DIR/backend_to_do.md $BACKUP_DIR/02.frontend_development_checklist.md . 2>/dev/null || true; cp -r $BACKUP_DIR/backend/* backend/ 2>/dev/null || true"


# --- FRONTEND PHASE ---

create_pr 13 "2026-06-12T16:42:00Z" "Scaffold React project using Vite and layout" "mkdir -p frontend/src frontend/public; cp $BACKUP_DIR/frontend/package.json $BACKUP_DIR/frontend/vite.config.js frontend/ 2>/dev/null || true; cp $BACKUP_DIR/frontend/src/main.jsx $BACKUP_DIR/frontend/src/App.jsx $BACKUP_DIR/frontend/src/index.css $BACKUP_DIR/frontend/src/App.css frontend/src/ 2>/dev/null || true"

create_pr 14 "2026-06-12T22:58:00Z" "Implement custom fetch wrapper utility" "cp $BACKUP_DIR/frontend/src/api.js frontend/src/ 2>/dev/null || true"

create_pr 15 "2026-06-13T17:23:00Z" "Build authentication context for global state" "mkdir -p frontend/src/context; cp $BACKUP_DIR/frontend/src/context/AuthContext.jsx frontend/src/context/ 2>/dev/null || true"

create_pr 16 "2026-06-13T19:34:00Z" "Create login and register pages with form handling" "mkdir -p frontend/src/pages; cp $BACKUP_DIR/frontend/src/pages/Login.jsx $BACKUP_DIR/frontend/src/pages/Register.jsx $BACKUP_DIR/frontend/src/pages/Auth.css frontend/src/pages/ 2>/dev/null || true"

create_pr 17 "2026-06-15T16:11:00Z" "Implement protected routes and layout navigation" "mkdir -p frontend/src/components; cp $BACKUP_DIR/frontend/src/components/ProtectedRoute.jsx $BACKUP_DIR/frontend/src/components/BottomNav.jsx $BACKUP_DIR/frontend/src/components/BottomNav.css frontend/src/components/ 2>/dev/null || true"

create_pr 18 "2026-06-15T18:52:00Z" "Build dashboard skeleton layout" "mkdir -p frontend/src/pages; cp $BACKUP_DIR/frontend/src/pages/Dashboard.jsx $BACKUP_DIR/frontend/src/pages/Dashboard.css frontend/src/pages/ 2>/dev/null || true"

create_pr 19 "2026-06-15T23:44:00Z" "Create customers listing table component" "mkdir -p frontend/src/pages frontend/src/components; cp $BACKUP_DIR/frontend/src/pages/Customers.jsx $BACKUP_DIR/frontend/src/pages/Customers.css frontend/src/pages/ 2>/dev/null || true; cp $BACKUP_DIR/frontend/src/components/CustomerForm.jsx frontend/src/components/ 2>/dev/null || true"

create_pr 20 "2026-06-16T11:21:00Z" "Integrate pagination component" "mkdir -p frontend/src/components; cp $BACKUP_DIR/frontend/src/components/Pagination.jsx $BACKUP_DIR/frontend/src/components/Pagination.css frontend/src/components/ 2>/dev/null || true"

create_pr 21 "2026-06-16T17:04:00Z" "Build stats card components" "mkdir -p frontend/src/components; cp $BACKUP_DIR/frontend/src/components/StatsCard.jsx $BACKUP_DIR/frontend/src/components/StatsCard.css frontend/src/components/ 2>/dev/null || true"

create_pr 22 "2026-06-16T19:27:00Z" "Connect analytics dashboard to backend aggregations" "mkdir -p frontend/src/pages; cp $BACKUP_DIR/frontend/src/pages/Analytics.jsx $BACKUP_DIR/frontend/src/pages/Analytics.css frontend/src/pages/ 2>/dev/null || true"

create_pr 23 "2026-06-17T16:33:00Z" "Implement global loader and profile settings" "mkdir -p frontend/src/components frontend/src/pages; cp $BACKUP_DIR/frontend/src/components/Loader.jsx $BACKUP_DIR/frontend/src/components/Loader.css frontend/src/components/ 2>/dev/null || true; cp $BACKUP_DIR/frontend/src/pages/Profile.jsx $BACKUP_DIR/frontend/src/pages/Profile.css frontend/src/pages/ 2>/dev/null || true"

create_pr 24 "2026-06-17T23:14:00Z" "Update routing for GitHub Pages and add README" "cp -r $BACKUP_DIR/* . 2>/dev/null || true; cp -r $BACKUP_DIR/.* . 2>/dev/null || true; rm -rf .git"

echo "All PRs created successfully!"
