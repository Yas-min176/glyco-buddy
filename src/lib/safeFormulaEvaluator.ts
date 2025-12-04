import { Parser } from 'expr-eval';

/**
 * Safely evaluates mathematical formulas for insulin calculation.
 * Uses expr-eval library which only allows mathematical operations,
 * preventing code injection attacks.
 */

// Create a parser with restricted operations (no functions that could be exploited)
const parser = new Parser({
  operators: {
    add: true,
    subtract: true,
    multiply: true,
    divide: true,
    power: true,
    remainder: true,
    factorial: false, // Disable to prevent large number attacks
    comparison: false,
    logical: false,
    conditional: false,
  }
});

// Whitelist of allowed variable names
const ALLOWED_VARIABLES = ['glucose', 'glicemia', 'g'];

/**
 * Validates and evaluates a formula safely
 * @param formula - The formula string (e.g., "(glucose - 100) / 30")
 * @param glucoseValue - The glucose value to substitute
 * @returns The calculated result or null if invalid
 */
export function evaluateFormula(formula: string, glucoseValue: number): number | null {
  try {
    // Normalize the formula: replace common variable names with 'glucose'
    let normalizedFormula = formula
      .toLowerCase()
      .replace(/glicemia/gi, 'glucose')
      .replace(/\bg\b/gi, 'glucose');

    // Parse the formula
    const expression = parser.parse(normalizedFormula);
    
    // Get used variables and validate they're allowed
    const usedVariables = expression.variables();
    for (const variable of usedVariables) {
      if (!ALLOWED_VARIABLES.includes(variable.toLowerCase())) {
        console.error(`Invalid variable in formula: ${variable}`);
        return null;
      }
    }

    // Evaluate with the glucose value
    const result = expression.evaluate({ glucose: glucoseValue });
    
    // Validate result is a reasonable number
    if (typeof result !== 'number' || !isFinite(result) || isNaN(result)) {
      return null;
    }

    // Reasonable bounds check for insulin units (0-100 is reasonable)
    if (result < 0 || result > 100) {
      return null;
    }

    return result;
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return null;
  }
}

/**
 * Validates a formula without evaluating it
 * @param formula - The formula string to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validateFormula(formula: string): { isValid: boolean; error?: string } {
  try {
    if (!formula || formula.trim().length === 0) {
      return { isValid: false, error: 'Fórmula não pode estar vazia' };
    }

    // Normalize the formula
    let normalizedFormula = formula
      .toLowerCase()
      .replace(/glicemia/gi, 'glucose')
      .replace(/\bg\b/gi, 'glucose');

    // Try to parse
    const expression = parser.parse(normalizedFormula);
    
    // Check variables
    const usedVariables = expression.variables();
    
    // Must contain at least the glucose variable
    if (!usedVariables.includes('glucose')) {
      return { 
        isValid: false, 
        error: 'A fórmula deve conter a variável "glucose" ou "glicemia"' 
      };
    }

    // Check for invalid variables
    for (const variable of usedVariables) {
      if (!ALLOWED_VARIABLES.includes(variable.toLowerCase())) {
        return { 
          isValid: false, 
          error: `Variável não permitida: ${variable}. Use apenas "glucose" ou "glicemia"` 
        };
      }
    }

    // Test with a sample value to ensure it works
    const testResult = expression.evaluate({ glucose: 150 });
    if (typeof testResult !== 'number' || !isFinite(testResult)) {
      return { isValid: false, error: 'Fórmula produz resultado inválido' };
    }

    return { isValid: true };
  } catch (error: any) {
    return { 
      isValid: false, 
      error: `Erro de sintaxe: ${error.message || 'Fórmula inválida'}` 
    };
  }
}
