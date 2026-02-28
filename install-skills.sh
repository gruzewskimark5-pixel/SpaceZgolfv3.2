#!/bin/bash

echo "Render Skills Installer"
echo "======================="
echo

echo "Which tool are you installing skills for?"
echo "1. Claude Code"
echo "2. OpenAI Codex"
echo "3. OpenCode"
echo "4. Cursor"
echo "5. Quit"

read -p "Select an option (1-5): " option

SKILLS_SOURCE_DIR="skills"
SKILL_DIRS=("render-deploy" "render-debug" "render-monitor" "render-migrate-from-heroku")

copy_skills() {
    local DEST_DIR=$1
    echo "Installing skills to $DEST_DIR..."

    if [ ! -d "$SKILLS_SOURCE_DIR" ]; then
        echo "Warning: '$SKILLS_SOURCE_DIR' directory not found in the current folder."
        echo "If you are running this from a downloaded archive, make sure you extracted it properly."
        echo "Will try to copy from the source directories if they exist."
    fi

    mkdir -p "$DEST_DIR"

    local copied_any=false

    for skill in "${SKILL_DIRS[@]}"; do
        if [ -d "$SKILLS_SOURCE_DIR/$skill" ]; then
            cp -R "$SKILLS_SOURCE_DIR/$skill" "$DEST_DIR/"
            echo "✓ Copied $skill"
            copied_any=true
        elif [ -d "$skill" ]; then
            # Fallback if the script is run from inside the skills directory
            cp -R "$skill" "$DEST_DIR/"
            echo "✓ Copied $skill"
            copied_any=true
        else
            echo "✗ Warning: Skill directory '$skill' not found. Skipping."
        fi
    done

    if [ "$copied_any" = true ]; then
        echo "Done copying skills!"
    else
        echo "No skills were copied. Please ensure you have the correct files downloaded."
    fi
}

case $option in
    1)
        echo
        echo "For Claude Code, you can use the plugin marketplace:"
        echo "  /plugin marketplace add render-oss/skills"
        echo "  /plugin install render@skills"
        echo
        read -p "Do you want to manually copy the skills instead (for skills mode)? (y/n): " manual
        if [[ "$manual" =~ ^[Yy]$ ]]; then
            copy_skills "$HOME/.claude/skills"
        fi
        ;;
    2)
        echo
        echo "For OpenAI Codex, you can use the skill-installer:"
        echo "  \$skill-installer render-deploy"
        echo "  \$skill-installer render-debug"
        echo "  \$skill-installer render-monitor"
        echo "  \$skill-installer render-migrate-from-heroku"
        echo
        read -p "Do you want to manually copy the skills instead? (y/n): " manual
        if [[ "$manual" =~ ^[Yy]$ ]]; then
            copy_skills "$HOME/.codex/skills"
        fi
        ;;
    3)
        echo
        echo "Installing for OpenCode..."
        copy_skills "$HOME/.config/opencode/skills"
        ;;
    4)
        echo
        echo "Installing for Cursor..."
        copy_skills "$HOME/.cursor/skills"
        ;;
    5)
        echo "Exiting."
        ;;
    *)
        echo "Invalid option."
        ;;
esac
