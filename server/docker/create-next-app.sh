set projectName [lindex $argv 0]
spawn npx create-next-app@latest $projectName
expect "Would you like to use ESLint?" { send "Yes\r" }
expect "Would you like to use Tailwind CSS?" { send "No\r" }
expect "Would you like your code inside a src/ directory?" { send "Yes\r" }
expect "Would you like to use App Router?" { send "Yes\r" }
expect "Would you like to use Turbopack for next dev?" { send "Yes\r" }
expect "Would you like to customize the import alias?" { send "Yes\r" }
expect "What import alias would you like configured?" { send "@/*\r" }
interact