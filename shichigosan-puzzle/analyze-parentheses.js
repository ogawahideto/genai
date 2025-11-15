// Analyze how many unique numbers can be created with 7, 5, 3 using parentheses

function evaluateExpression(expr) {
    try {
        return eval(expr.replace(/×/g, '*').replace(/÷/g, '/'));
    } catch (e) {
        return null;
    }
}

function generateAllExpressions() {
    const numbers = [7, 5, 3];
    const operators = ['+', '-', '×', '÷'];
    const results = new Map();

    // Helper to add result
    function addResult(expr, value) {
        if (value === null || !Number.isFinite(value)) return;
        // Round to avoid floating point issues
        const rounded = Math.round(value * 1000) / 1000;
        if (!results.has(rounded)) {
            results.set(rounded, []);
        }
        if (!results.get(rounded).includes(expr)) {
            results.get(rounded).push(expr);
        }
    }

    // 1 number
    numbers.forEach(n => {
        addResult(String(n), n);
    });

    // 2 numbers with 1 operator (all permutations)
    for (let i = 0; i < numbers.length; i++) {
        for (let j = 0; j < numbers.length; j++) {
            if (i === j) continue;
            for (let op of operators) {
                const expr = `${numbers[i]}${op}${numbers[j]}`;
                const result = evaluateExpression(expr);
                addResult(expr, result);
            }
        }
    }

    // 3 numbers with 2 operators (all permutations)
    const perms = [
        [7,5,3], [7,3,5], [5,7,3], [5,3,7], [3,7,5], [3,5,7]
    ];

    for (let perm of perms) {
        for (let op1 of operators) {
            for (let op2 of operators) {
                const a = perm[0], b = perm[1], c = perm[2];

                // Without parentheses: a op1 b op2 c (left to right evaluation)
                const expr1 = `${a}${op1}${b}${op2}${c}`;
                const result1 = evaluateExpression(expr1);
                addResult(expr1, result1);

                // With parentheses: (a op1 b) op2 c (explicit left)
                const expr2 = `(${a}${op1}${b})${op2}${c}`;
                const result2 = evaluateExpression(expr2);
                addResult(expr2, result2);

                // With parentheses: a op1 (b op2 c) (right side first)
                const expr3 = `${a}${op1}(${b}${op2}${c})`;
                const result3 = evaluateExpression(expr3);
                addResult(expr3, result3);
            }
        }
    }

    return results;
}

console.log("=== カッコなしで作れる数の分析 ===\n");

// Without parentheses (left-to-right only)
const withoutParens = new Map();
const numbers = [7, 5, 3];
const operators = ['+', '-', '×', '÷'];

// 1 number
numbers.forEach(n => {
    if (!withoutParens.has(n)) withoutParens.set(n, []);
    withoutParens.get(n).push(String(n));
});

// 2 numbers
for (let i = 0; i < numbers.length; i++) {
    for (let j = 0; j < numbers.length; j++) {
        if (i === j) continue;
        for (let op of operators) {
            const expr = `${numbers[i]}${op}${numbers[j]}`;
            const result = evaluateExpression(expr);
            if (result !== null && Number.isFinite(result)) {
                const rounded = Math.round(result * 1000) / 1000;
                if (!withoutParens.has(rounded)) withoutParens.set(rounded, []);
                if (!withoutParens.get(rounded).includes(expr)) {
                    withoutParens.get(rounded).push(expr);
                }
            }
        }
    }
}

// 3 numbers (left-to-right only)
const perms = [[7,5,3], [7,3,5], [5,7,3], [5,3,7], [3,7,5], [3,5,7]];
for (let perm of perms) {
    for (let op1 of operators) {
        for (let op2 of operators) {
            const expr = `${perm[0]}${op1}${perm[1]}${op2}${perm[2]}`;
            const result = evaluateExpression(expr);
            if (result !== null && Number.isFinite(result)) {
                const rounded = Math.round(result * 1000) / 1000;
                if (!withoutParens.has(rounded)) withoutParens.set(rounded, []);
                if (!withoutParens.get(rounded).includes(expr)) {
                    withoutParens.get(rounded).push(expr);
                }
            }
        }
    }
}

console.log(`カッコなしで作れる整数: ${Array.from(withoutParens.keys()).filter(n => Number.isInteger(n)).length}種類`);
console.log(`カッコなしで作れる数（小数含む）: ${withoutParens.size}種類\n`);

console.log("=== カッコありで作れる数の分析 ===\n");

const withParens = generateAllExpressions();

console.log(`カッコありで作れる整数: ${Array.from(withParens.keys()).filter(n => Number.isInteger(n)).length}種類`);
console.log(`カッコありで作れる数（小数含む）: ${withParens.size}種類\n`);

// Compare
const integersWithoutParens = Array.from(withoutParens.keys()).filter(n => Number.isInteger(n)).sort((a, b) => a - b);
const integersWithParens = Array.from(withParens.keys()).filter(n => Number.isInteger(n)).sort((a, b) => a - b);

console.log("=== 比較結果 ===\n");
console.log(`整数の増加: ${integersWithoutParens.length} → ${integersWithParens.length} (+${integersWithParens.length - integersWithoutParens.length}種類)\n`);

// Find new integers only possible with parentheses
const newIntegers = integersWithParens.filter(n => !integersWithoutParens.includes(n));
console.log(`カッコを使わないと作れない整数: ${newIntegers.length}種類\n`);

if (newIntegers.length > 0) {
    console.log("カッコによって新たに作れるようになった整数（例）:");
    newIntegers.slice(0, 20).forEach(num => {
        const examples = withParens.get(num).filter(expr => expr.includes('(')).slice(0, 2);
        if (examples.length > 0) {
            console.log(`  ${num}: ${examples.join(', ')}`);
        }
    });
}

console.log("\n=== すべての整数（カッコあり） ===\n");
integersWithParens.forEach(num => {
    const examples = withParens.get(num).slice(0, 2);
    console.log(`${num}: ${examples.join(', ')}`);
});

console.log(`\n\n総計: ${integersWithParens.length}種類の整数が作成可能`);
