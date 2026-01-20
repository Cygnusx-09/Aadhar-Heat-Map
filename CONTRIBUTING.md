# Contributing to India Demographic Heatmap Tool

First off, thank you for considering contributing to the India Demographic Heatmap Tool! 🎉

It's people like you that make this tool such a great resource for the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (screenshots, code snippets, etc.)
- **Describe the behavior you observed** and what you expected
- **Include your environment details** (browser, OS, Node version)

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 11]
 - Browser: [e.g. Chrome 120]
 - Version: [e.g. 1.0.0]
```

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternative solutions** you've considered

### 🔧 Code Contributions

#### Good First Issues

Look for issues labeled `good first issue` - these are great for newcomers!

#### Areas for Contribution

- **Features**: New visualization types, filters, or analytics
- **Performance**: Optimization for large datasets
- **UI/UX**: Design improvements and accessibility
- **Documentation**: Tutorials, examples, API docs
- **Testing**: Unit tests, integration tests, E2E tests
- **Bug Fixes**: Resolving reported issues

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- A code editor (VS Code recommended)

### Setup Steps

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Aadhar-Heat-Map.git
   cd Aadhar-Heat-Map
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Cygnusx-09/Aadhar-Heat-Map.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Project Structure

```
src/
├── components/     # React components
├── lib/           # Utility libraries
├── store/         # State management
├── types/         # TypeScript types
├── utils/         # Business logic
└── workers/       # Web Workers
```

## Pull Request Process

### Before Submitting

1. **Test your changes** thoroughly
2. **Run linting**: `npm run lint`
3. **Build successfully**: `npm run build`
4. **Update documentation** if needed
5. **Add tests** for new features (if applicable)

### Submitting a PR

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub

3. **Fill out the PR template** with:
   - Description of changes
   - Related issue number (if applicable)
   - Screenshots/GIFs for UI changes
   - Checklist completion

4. **Wait for review** - maintainers will review your PR

5. **Address feedback** if requested

6. **Celebrate!** 🎉 Your contribution will be merged

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Related Issue
Fixes #(issue number)

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes
```

## Coding Standards

### TypeScript

- Use **TypeScript** for all new code
- Define proper **types and interfaces**
- Avoid `any` type unless absolutely necessary
- Use **meaningful variable names**

### React

- Use **functional components** with hooks
- Keep components **small and focused**
- Use **proper prop types**
- Implement **error boundaries** where appropriate

### Code Style

- **Indentation**: 4 spaces (configured in project)
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Line length**: Max 120 characters
- **Naming**:
  - Components: PascalCase (`MapViewer`)
  - Functions: camelCase (`calculateStats`)
  - Constants: UPPER_SNAKE_CASE (`MAX_RECORDS`)
  - Files: Match component name (`MapViewer.tsx`)

### Example

```typescript
// Good ✅
interface DemographicData {
    state: string;
    population: number;
}

export const calculateTotalPopulation = (data: DemographicData[]): number => {
    return data.reduce((sum, item) => sum + item.population, 0);
};

// Bad ❌
const calc = (d: any) => {
    let s = 0
    for (let i = 0; i < d.length; i++) {
        s += d[i].population
    }
    return s
}
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples

```bash
feat(analytics): add trend analysis for enrollment data

fix(map): resolve zoom level issue on mobile devices

docs(readme): update installation instructions

refactor(store): simplify state management logic

perf(charts): optimize rendering for large datasets
```

### Best Practices

- Use **present tense** ("add feature" not "added feature")
- Use **imperative mood** ("move cursor to..." not "moves cursor to...")
- Keep **subject line under 50 characters**
- Capitalize **first letter** of subject
- **No period** at the end of subject
- Separate subject from body with blank line
- Wrap body at **72 characters**
- Use body to explain **what and why**, not how

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Write tests for **new features**
- Ensure **existing tests pass**
- Aim for **high code coverage**
- Test **edge cases**

## Documentation

### Code Comments

- Comment **complex logic**
- Use **JSDoc** for functions and components
- Keep comments **up-to-date**

### Example

```typescript
/**
 * Calculates the Z-score for anomaly detection
 * @param value - The value to analyze
 * @param mean - The mean of the dataset
 * @param stdDev - The standard deviation
 * @returns The Z-score indicating deviation from mean
 */
const calculateZScore = (value: number, mean: number, stdDev: number): number => {
    return (value - mean) / stdDev;
};
```

## Getting Help

- 💬 **Discussions**: Ask questions in [GitHub Discussions](https://github.com/Cygnusx-09/Aadhar-Heat-Map/discussions)
- 🐛 **Issues**: Report bugs in [GitHub Issues](https://github.com/Cygnusx-09/Aadhar-Heat-Map/issues)
- 📧 **Email**: Contact maintainers (if urgent)

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- GitHub contributors page

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🙏

Every contribution, no matter how small, makes a difference. We appreciate your time and effort in making this project better.
