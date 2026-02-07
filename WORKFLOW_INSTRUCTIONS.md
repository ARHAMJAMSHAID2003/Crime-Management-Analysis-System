# Workflow Documentation Assignment Instructions

## Overview
This repository is set up for collaborative workflow documentation using GitHub branches and merges.

## Assignment Requirements
- **File**: `workflow.txt` contains templates for 3 workflows
- **TAs to add as collaborators**: `adeenaoop` and `Muh-Aqib-Shah`
- **Objective**: Each team member fills in one workflow in their own branch, then merges back to main

## Step-by-Step Instructions

### For Each Team Member (including Group Leader):

1. **Create your branch from main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b workflow-member-[your-name]
   ```

2. **Edit workflow.txt:**
   - Open `workflow.txt`
   - Fill in ONE workflow section (Workflow 1, 2, or 3)
   - Replace placeholders with your actual workflow description
   - Include step-by-step description, key features, and functionalities

3. **Commit your changes:**
   ```bash
   git add workflow.txt
   git commit -m "Add workflow [1/2/3]: [Your workflow title]"
   git push origin workflow-member-[your-name]
   ```

### For Group Leader (Final Step):

1. **Merge all branches into main:**
   ```bash
   git checkout main
   git merge workflow-member-[name1]
   git merge workflow-member-[name2]
   git merge workflow-member-[name3]
   git push origin main
   ```

## Verification
The version history in GitHub will show:
- Individual commits from each team member
- Each workflow added in a separate branch
- Final merge bringing everything together

## Important Notes
- Each workflow must be done in a separate branch
- Even if your group has fewer than 3 members, create 3 workflows (one member can do multiple)
- Make sure all branches are merged before submission
- Submission: Provide the GitHub repository link
