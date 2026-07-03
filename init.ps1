# Used from AI in the initialization phase to ensure that the environment is set up
# correctly for the application to run. This script can include tasks such as checking
# for required dependencies, installing packages, and verifying that the build works.

# The tool can be called with a param to trigger a specific task, for example:
# .\init.ps1 (setup|build)

# Example usage:
# .\init.ps1 setup
# .\init.ps1 build

# 0. Switch case to handle different initialization tasks based on the provided argument
param(
    [string]$task = "setup"
)

# Variables:
$projectName = "ww-turni-ssg"
$minNodeMajor = 18

switch ($task) {
    "setup" {
        # 1. Setup phase
        Write-Host "Starting setup phase..."

        # 1.1 Verify that Node.js is installed
        if (-Not (Get-Command "node" -ErrorAction SilentlyContinue)) {
            Write-Host "Error: Node.js is not installed. Please install it from https://nodejs.org/ (v$minNodeMajor or higher)."
            exit 1
        }

        # 1.2 Verify that npm is installed
        if (-Not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
            Write-Host "Error: npm is not installed. It usually ships with Node.js: https://nodejs.org/."
            exit 1
        }

        Write-Host "Node.js and npm are installed."

        # 1.3 Verify the installed Node.js major version is >= $minNodeMajor
        $nodeVersion = (& node --version).TrimStart("v")
        $nodeMajor = [int]($nodeVersion.Split(".")[0])
        if ($nodeMajor -lt $minNodeMajor) {
            Write-Host "Error: Node.js v$minNodeMajor or higher is required. Installed version is v$nodeVersion."
            exit 1
        }

        Write-Host "Required Node.js version is installed (v$nodeVersion)."

        # 1.4 Install dependencies
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: npm install failed."
            exit 1
        }

        Write-Host "Dependencies installed successfully."

        # 1.5 Verify the Playwright MCP skill is available (non-fatal: dev can proceed without it).
        #     See docs/UI_TESTING.md for how the UI is tested with Playwright.
        if (Get-Command "claude" -ErrorAction SilentlyContinue) {
            $mcpList = (& claude mcp list 2>&1 | Out-String)
            $playwrightConnected = $mcpList -match "(?im)^.*playwright.*Connected.*$"
            if ($playwrightConnected) {
                Write-Host "Playwright MCP skill disponibile (vedi docs/UI_TESTING.md)."
            } else {
                Write-Warning "Playwright MCP skill non disponibile o non connessa. I test UI (docs/UI_TESTING.md) non saranno eseguibili finche' non e' configurata."
            }
        } else {
            Write-Warning "Claude CLI non trovata: check Playwright saltato (vedi docs/UI_TESTING.md)."
        }

        Write-Host "Setup phase completed."
    }
    "build" {
        # 2. Build phase - proves that TypeScript, React and Vite are working
        Write-Host "Starting build phase..."

        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error: npm run build failed (tsc -b && vite build)."
            exit 1
        }

        Write-Host "Build succeeded. Static output generated in dist/."
        Write-Host "Build phase completed."
    }
    default {
        Write-Host "Invalid task specified. Please use 'setup' or 'build'."
    }
}
