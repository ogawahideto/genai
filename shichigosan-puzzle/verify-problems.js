// Verify all problems in the Shichi-Go-San puzzle are solvable with 7, 5, 3

const problems = [
    { target: 15, solutions: ["7+5+3", "5+7+3", "5×3", "3×5"] },
    { target: 9, solutions: ["7+5-3", "5+7-3"] },
    { target: 5, solutions: ["7-5+3", "7+3-5"] },
    { target: 35, solutions: ["7×5", "5×7"] },
    { target: 21, solutions: ["7×3", "3×7"] },
    { target: 2, solutions: ["7-5", "5-3"] },
    { target: 105, solutions: ["7×5×3", "7×3×5", "5×7×3", "5×3×7", "3×7×5", "3×5×7"] },
    { target: 1, solutions: ["5-7+3", "5+3-7", "3+5-7"] },
    { target: 12, solutions: ["7+5", "5+7"] },
    { target: 8, solutions: ["5+3", "3+5"] },
    { target: 4, solutions: ["7-3"] },
    { target: 10, solutions: ["7+3", "3+7"] },
    { target: 16, solutions: ["7×3-5", "3×7-5"] },
    { target: 26, solutions: ["7×3+5", "3×7+5"] },
    { target: 38, solutions: ["7×5+3", "5×7+3"] }
];

function evaluateExpression(expr) {
    // Convert to JavaScript syntax
    let jsExpr = expr.replace(/×/g, '*').replace(/÷/g, '/');
    try {
        return eval(jsExpr);
    } catch (e) {
        return null;
    }
}

function usesOnlyNumbers(expr, allowedNumbers) {
    // Extract all numbers from expression
    const numbers = expr.match(/\d+/g);
    if (!numbers) return false;

    // Check each number
    for (let num of numbers) {
        if (!allowedNumbers.includes(parseInt(num))) {
            return false;
        }
    }
    return true;
}

function countNumberUsage(expr) {
    const numbers = expr.match(/\d+/g);
    if (!numbers) return {};

    const count = {};
    numbers.forEach(num => {
        count[num] = (count[num] || 0) + 1;
    });
    return count;
}

function checkNumberUsageLimit(expr) {
    const usage = countNumberUsage(expr);
    // Each of 7, 5, 3 can only be used once
    if (usage['7'] && usage['7'] > 1) return false;
    if (usage['5'] && usage['5'] > 1) return false;
    if (usage['3'] && usage['3'] > 1) return false;
    return true;
}

console.log("=== 七五三パズル問題検証 ===\n");

let allValid = true;
let invalidProblems = [];

problems.forEach((problem, index) => {
    console.log(`レベル ${index + 1}: 目標 = ${problem.target}`);

    let hasValidSolution = false;
    let invalidSolutions = [];

    problem.solutions.forEach(solution => {
        const result = evaluateExpression(solution);
        const usesOnly753 = usesOnlyNumbers(solution, [7, 5, 3]);
        const usage = countNumberUsage(solution);
        const withinLimit = checkNumberUsageLimit(solution);

        // Check if solution uses only 7, 5, 3
        if (!usesOnly753) {
            invalidSolutions.push({
                solution,
                reason: "7, 5, 3以外の数字を使用"
            });
            console.log(`  ❌ ${solution} = ${result} (7, 5, 3以外の数字を使用)`);
            return;
        }

        // Check if numbers are used more than once
        if (!withinLimit) {
            invalidSolutions.push({
                solution,
                reason: "同じ数字を2回以上使用"
            });
            console.log(`  ❌ ${solution} = ${result} (同じ数字を2回以上使用: ${JSON.stringify(usage)})`);
            return;
        }

        // Check if result matches target
        if (result !== problem.target) {
            invalidSolutions.push({
                solution,
                reason: `計算結果が${result}で目標の${problem.target}と一致しない`
            });
            console.log(`  ❌ ${solution} = ${result} ≠ ${problem.target}`);
            return;
        }

        // Valid solution
        hasValidSolution = true;
        console.log(`  ✓ ${solution} = ${result} (使用数字: ${JSON.stringify(usage)})`);
    });

    if (!hasValidSolution) {
        allValid = false;
        invalidProblems.push({
            level: index + 1,
            target: problem.target,
            solutions: problem.solutions,
            invalidSolutions
        });
        console.log(`  ⚠️ 有効な解答がありません！\n`);
    } else {
        console.log("");
    }
});

console.log("=== 検証結果 ===");
if (allValid) {
    console.log("✅ すべての問題に有効な解答があります！");
} else {
    console.log(`❌ ${invalidProblems.length}個の問題に問題があります:\n`);
    invalidProblems.forEach(prob => {
        console.log(`レベル ${prob.level} (目標: ${prob.target})`);
        prob.invalidSolutions.forEach(inv => {
            console.log(`  - ${inv.solution}: ${inv.reason}`);
        });
        console.log("");
    });
}

// Generate all possible valid expressions using 7, 5, 3
console.log("\n=== 追加分析: 7, 5, 3で作れる数 ===");

function generateExpressions() {
    const numbers = [7, 5, 3];
    const operators = ['+', '-', '×', '÷'];
    const results = new Map();

    // 1 number
    numbers.forEach(n => {
        if (!results.has(n)) results.set(n, []);
        results.get(n).push(String(n));
    });

    // 2 numbers with 1 operator
    for (let i = 0; i < numbers.length; i++) {
        for (let j = 0; j < numbers.length; j++) {
            if (i === j) continue;
            for (let op of operators) {
                const expr = `${numbers[i]}${op}${numbers[j]}`;
                const result = evaluateExpression(expr);
                if (result !== null && Number.isInteger(result)) {
                    if (!results.has(result)) results.set(result, []);
                    results.get(result).push(expr);
                }
            }
        }
    }

    // 3 numbers with 2 operators (simplified - just chain operations)
    for (let perm of [[7,5,3], [7,3,5], [5,7,3], [5,3,7], [3,7,5], [3,5,7]]) {
        for (let op1 of operators) {
            for (let op2 of operators) {
                const expr = `${perm[0]}${op1}${perm[1]}${op2}${perm[2]}`;
                const result = evaluateExpression(expr);
                if (result !== null && Number.isInteger(result) && result >= 0) {
                    if (!results.has(result)) results.set(result, []);
                    if (!results.get(result).includes(expr)) {
                        results.get(result).push(expr);
                    }
                }
            }
        }
    }

    return results;
}

const possibleResults = generateExpressions();
const sortedResults = Array.from(possibleResults.keys()).sort((a, b) => a - b);

console.log("\n作成可能な数（サンプル）:");
sortedResults.slice(0, 30).forEach(num => {
    const examples = possibleResults.get(num).slice(0, 2);
    console.log(`${num}: ${examples.join(', ')}`);
});

console.log(`\n合計 ${sortedResults.length} 種類の整数が作成可能です。`);
