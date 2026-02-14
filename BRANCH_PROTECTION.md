# Branch Protection Setup Guide

This guide explains how to configure branch protection for the `main` branch so that only the repository owner can commit directly, while others must open pull requests.

## Quick Summary

This repository includes:
- **CODEOWNERS file**: Automatically requests review from @theagilepilot for all changes
- **Branch Protection workflow**: Provides an additional check layer (though limited by GitHub Actions permissions)
- **This guide**: Instructions to enable full branch protection via GitHub settings

## Complete Branch Protection Setup

To fully protect the `main` branch, you need to configure GitHub's branch protection rules. Here's how:

### Step 1: Access Branch Protection Settings

1. Go to your repository on GitHub: https://github.com/theagilepilot/learn-anything
2. Click on **Settings** (top navigation bar)
3. In the left sidebar, click on **Branches** under "Code and automation"
4. Click **Add branch protection rule** (or **Add rule**)

### Step 2: Configure Protection Rule

Configure the following settings:

#### Branch name pattern
- Enter: `main`

#### Protection Rules to Enable

✅ **Require a pull request before merging**
- Check this option
- Optional: Set "Required number of approvals before merging" to 1 or more
- Optional: Check "Dismiss stale pull request approvals when new commits are pushed"
- Optional: Check "Require review from Code Owners" (works with the CODEOWNERS file)

✅ **Require status checks to pass before merging**
- Check this option
- Search for and add: `check-branch-protection` (from the branch-protection.yml workflow)
- Optional: Check "Require branches to be up to date before merging"

✅ **Require conversation resolution before merging**
- Check this option (optional but recommended)

✅ **Do not allow bypassing the above settings**
- **IMPORTANT**: Leave this UNCHECKED or configure specific bypass permissions

#### Allow Specific Users to Bypass

Under "Allow specified actors to bypass required pull requests":
- Click "Add bypass"
- Add yourself (@theagilepilot) as an allowed actor
- This allows you to push directly while requiring others to use PRs

Alternative approach if the above option is not available:
- Check "Restrict who can push to matching branches"
- Add @theagilepilot to the list
- This restricts direct pushes to only specified users

### Step 3: Save the Protection Rule

- Scroll to the bottom and click **Create** or **Save changes**

## Files in This Repository

### .github/CODEOWNERS
This file automatically requests @theagilepilot as a reviewer for all pull requests. This ensures you're notified of all changes.

### .github/workflows/branch-protection.yml
This workflow provides an additional layer of enforcement by checking who is pushing to main. However, note that GitHub Actions workflows triggered by direct pushes may not be able to block the push itself (they run after the push), so the GitHub branch protection rules are the primary enforcement mechanism.

## Verification

After setting up branch protection:

1. Try pushing directly to main from another account - it should be blocked
2. Create a pull request from another account - it should require your review
3. As the repository owner, you should still be able to push directly or merge PRs

## Additional Security (Optional)

For even stronger protection:

1. **Require signed commits**: Under branch protection, enable "Require signed commits"
2. **Require linear history**: Check this to prevent merge commits
3. **Enable "Include administrators"**: Makes the rules apply to administrators too (but allows bypass when needed)

## Troubleshooting

- **Can't find branch protection settings**: Make sure you have admin access to the repository
- **Rules not applying**: Wait a few minutes for GitHub to propagate the settings
- **Can't bypass as owner**: Make sure you're listed in the bypass permissions or that "Include administrators" is not checked

## References

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [CODEOWNERS Documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
