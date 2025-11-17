# Multi-Agent Implementation Strategy

## Agent Roles & Responsibilities

### 1. Planner Agent (subagent_type: Plan)
**Purpose**: Take a phase from the main plan and create detailed technical implementation steps
**Thoroughness**: medium
**Responsibilities**:
- Break down high-level phase into specific technical tasks
- Define file structure and code organization
- Identify dependencies and order of implementation
- Create concrete acceptance criteria
- Focus on technical details, no PM jargon
**Output**: Detailed technical plan written to plans/ directory

### 2. Coder Agent (subagent_type: general-purpose)
**Purpose**: Implement code according to detailed plan
**Responsibilities**:
- Create project structure and files
- Implement game objects, scenes, managers
- Follow TypeScript and Phaser 3 best practices
- Ensure code is type-safe and well-structured
- Add inline comments for complex logic
**Output**: Working code committed to repository

### 3. Tester Agent (subagent_type: general-purpose)
**Purpose**: Write and execute tests for implemented features
**Responsibilities**:
- Write unit tests for managers and utilities
- Create integration tests for game mechanics
- Run tests and verify passing status
- Document test coverage
- Report any bugs or issues found
**Output**: Test files and test execution reports

### 4. Reviewer Agent (subagent_type: general-purpose)
**Purpose**: Strict quality review of implementation
**Responsibilities**:
- Verify implementation matches detailed plan
- Check code quality, readability, maintainability
- Identify potential bugs or edge cases
- Verify TypeScript types are properly used
- Check for security issues (XSS, injection, etc.)
- Ensure no hardcoded values that should be configurable
- Validate game mechanics feel and performance
**Output**: Review report with findings and recommendations

## Development Phases

### Phase 1: Project Setup
- Planner: Define exact project structure, dependencies, configuration files
- Coder: Initialize Vite project, install Phaser, create basic structure
- Tester: Verify build system works, create initial test setup
- Reviewer: Check project structure follows plan, verify dependencies are correct versions

### Phase 2: Chameleon & Tongue Mechanic
- Planner: Detail Chameleon class structure, Tongue mechanics, input handling
- Coder: Implement Chameleon and Tongue classes with rotation and shooting
- Tester: Test rotation bounds, tongue extension/retraction, cooldown system
- Reviewer: Verify feel of mechanic, check for performance issues

### Phase 3: Falling Cards System
- Planner: Detail QuestionCard and InsectCard implementations
- Coder: Implement falling cards with gentle animations
- Tester: Test card spawning, falling speed, despawn behavior
- Reviewer: Check animation smoothness, verify card rendering

### Phase 4: Collision & Catching
- Planner: Detail collision detection algorithm, catch mechanics
- Coder: Implement tongue-to-insect collision and catch behavior
- Tester: Test collision accuracy, edge cases, catch animation
- Reviewer: Verify collision feels fair, check performance of detection

### Phase 5: Question Management & Content
- Planner: Detail insect database structure, question pairing logic
- Coder: Implement QuestionManager, create insect/question data
- Tester: Test question generation, shuffling, distractor selection
- Reviewer: Verify content quality, check for repeated questions

## Implementation Log

### Session Start
- Date: 2025-11-17
- Main plan: /home/user/chameleon/plans/chameleon-tongue-reading-game.md
- Strategy: Multi-agent approach with 4 specialized roles
- Target: Implement Phases 1-5 (core mechanics and content)

### Agent Invocations
(To be logged as agents are launched)

