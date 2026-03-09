#!/usr/bin/env python3
"""
Deep Research Automation Script

Analyzes user queries to determine if they require deep research,
then automatically switches to GP model for comprehensive analysis.
"""

import sys
import json
import re

# Keywords that indicate complex analysis needs
DEEP_RESEARCH_INDICATORS = {
    # Analysis depth
    "comprehensive", "thorough", "in-depth", "detailed", "extensive",
    "systematic", "exhaustive", "complete", "full", "deep",
    
    # Research actions
    "research", "analyze", "investigate", "explore", "study",
    "examine", "review", "assess", "evaluate", "compare",
    "contrast", "synthesize", "summarize findings",
    
    # Complexity indicators
    "implications", "consequences", "trade-offs", "alternatives",
    "pros and cons", "advantages", "disadvantages", "risks",
    "opportunities", "challenges", "solutions", "recommendations",
    "strategy", "framework", "methodology", "approach",
    
    # Multi-aspect queries
    "factors", "aspects", "dimensions", "perspectives", "viewpoints",
    "stakeholders", "context", "background", "history", "trends",
    "future", "outlook", "forecast", "prediction",
    
    # Domain-specific deep analysis
    "market analysis", "competitive analysis", "swot", "pestle",
    "porter", "benchmark", "best practice", "case study",
    "literature review", "meta-analysis", "survey", "data analysis",
    "statistical", "correlation", "causation", "hypothesis"
}

# Simple query patterns that don't need deep research
SIMPLE_QUERY_PATTERNS = [
    r'^\s*(?:hi|hello|hey|你好|嗨)\s*$',  # Greetings
    r'^\s*(?:thanks?|thank you|谢谢|谢了)\s*$',  # Thanks
    r'^\s*(?:ok|okay|好的|行|可以)\s*$',  # Acknowledgments
    r'^\s*(?:bye|goodbye|再见|拜拜)\s*$',  # Goodbyes
    r'^\s*(?:what\s+(?:is|are)|how\s+to|where\s+is)\s+\S+\s*[?]?\s*$',  # Simple factual
    r'^\s*(?:yes|no|yep|nah)\s*$',  # Simple yes/no
]

def is_simple_query(query: str) -> bool:
    """Check if query is a simple interaction that doesn't need deep research."""
    query_lower = query.lower().strip()
    
    for pattern in SIMPLE_QUERY_PATTERNS:
        if re.match(pattern, query_lower, re.IGNORECASE):
            return True
    
    # Very short queries are likely simple
    if len(query_lower.split()) <= 3:
        return True
    
    return False

def analyze_complexity(query: str) -> dict:
    """
    Analyze query to determine if it needs deep research.
    Returns analysis result with recommendation.
    """
    query_lower = query.lower()
    words = set(re.findall(r'\b\w+\b', query_lower))
    
    # Check if simple query first
    if is_simple_query(query):
        return {
            "needs_deep_research": False,
            "reason": "Simple query that doesn't require deep analysis",
            "confidence": "high",
            "matched_indicators": [],
            "recommendation": "Use current model"
        }
    
    # Find matching deep research indicators
    matched_indicators = words.intersection(DEEP_RESEARCH_INDICATORS)
    
    # Additional pattern-based detection
    complex_patterns = [
        r'(?:compare|contrast|difference between).{10,50}(?:and|vs\.?)',
        r'(?:pros?\s+and\s+cons?|advantages?\s+and\s+disadvantages?)',
        r'(?:how|what).{5,30}(?:impact|affect|influence|effect)',
        r'(?:why|reason).{5,40}(?:because|due to|caused by)',
        r'(?:should|ought to|need to).{10,50}(?:because|since|as)',
        r'(?:future|predict|forecast|outlook|trend).{5,40}(?:next|upcoming|coming)',
        r'(?:solution|solve|fix|address).{5,40}(?:problem|issue|challenge)',
    ]
    
    pattern_matches = []
    for pattern in complex_patterns:
        if re.search(pattern, query_lower):
            pattern_matches.append(pattern[:30] + "...")
    
    # Scoring
    score = len(matched_indicators) + len(pattern_matches) * 2
    
    # Determine if deep research is needed
    needs_deep_research = score >= 2 or len(matched_indicators) >= 2 or len(pattern_matches) >= 1
    
    # Build reasoning
    reasons = []
    if matched_indicators:
        reasons.append(f"Detected deep research keywords: {', '.join(list(matched_indicators)[:5])}")
    if pattern_matches:
        reasons.append(f"Matched complex query patterns ({len(pattern_matches)} patterns)")
    if len(query.split()) > 20:
        reasons.append("Long query with multiple components")
    
    reason = "; ".join(reasons) if reasons else "Standard query complexity"
    
    return {
        "needs_deep_research": needs_deep_research,
        "reason": reason,
        "confidence": "high" if score >= 4 else "medium" if score >= 2 else "low",
        "matched_indicators": list(matched_indicators)[:10],
        "pattern_matches": len(pattern_matches),
        "score": score,
        "recommendation": "Switch to GP model for deep research" if needs_deep_research else "Use current model"
    }

def main():
    """Main entry point for the script."""
    if len(sys.argv) < 2:
        print("Usage: python deep_research.py '<user query>'", file=sys.stderr)
        sys.exit(1)
    
    query = sys.argv[1]
    result = analyze_complexity(query)
    
    # Output as JSON for parsing by the skill
    print(json.dumps(result, indent=2))
    
    # Exit with appropriate code
    sys.exit(0 if result["needs_deep_research"] else 1)

if __name__ == "__main__":
    main()
