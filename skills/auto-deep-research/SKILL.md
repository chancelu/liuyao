---
name: auto-deep-research
description: Automatically detect complex analytical queries and switch to GP model for deep research. Use when the user asks a question that requires comprehensive analysis, multi-faceted research, comparative studies, strategic evaluation, or any query where deep investigation would produce better results.
---

# Auto Deep Research

This skill automatically analyzes user queries to determine if they require deep research, and if so, switches to the GP model for comprehensive analysis.

## When to Use This Skill

Use this skill when the user asks questions involving:

- **Complex analysis**: Multi-faceted problems requiring thorough investigation
- **Comparative studies**: Comparing options, approaches, or solutions
- **Strategic evaluation**: Assessing pros/cons, risks, opportunities
- **Research-heavy topics**: Literature review, market analysis, trend forecasting
- **Decision support**: Recommendations with reasoning and justification
- **Deep dives**: Topics requiring extensive background and context

## How It Works

1. **Query Analysis**: The skill analyzes the user's query for:
   - Deep research keywords (analyze, evaluate, compare, assess, etc.)
   - Complex query patterns (multi-part questions, comparative structures)
   - Query length and complexity indicators

2. **Decision**: Based on the analysis, the skill determines if deep research is needed

3. **Model Switch**: If deep research is recommended, the skill switches to the GP model automatically

## Usage

Simply ask your complex question normally. The skill will automatically detect if deep research is needed.

Examples of queries that trigger deep research:
- "Analyze the pros and cons of different cloud providers for a startup"
- "Compare React, Vue, and Angular for building a large-scale enterprise app"
- "Evaluate the risks and opportunities in the current AI market"
- "What are the implications of recent changes in data privacy regulations?"
- "Research best practices for microservices architecture"

## Technical Details

The analysis script is located at `scripts/deep_research.py`. It evaluates queries based on:

- **Keyword matching**: 100+ deep research indicators
- **Pattern matching**: Complex query structures
- **Scoring algorithm**: Weighted scoring to determine research necessity

To manually test a query:
```bash
python scripts/deep_research.py "Your query here"
```

Returns JSON with analysis results and recommendation.
