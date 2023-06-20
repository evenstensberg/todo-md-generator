import fs from 'node:fs'
import walk from './walk.mjs'

let TODOS = []

function get_date_string() {
  const date = new Date()
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}_${month}_${day}`
}

function generate_unique_filename_and_timestamp() {
  return `todo_backlog_${get_date_string()}.md`
}

function generate_md_string_and_write() {
  let generated = '# TODO Backlog \n\n'
  TODOS.forEach((todo) => {
    generated += todo + '\n'
  })
  fs.writeFileSync(generate_unique_filename_and_timestamp(), String(generated))
}

function check_comment_and_append_todo(buffer, line_number, file_name) {
  if (buffer.includes('// TODO')) {
    const header = `### ${buffer.slice(buffer.indexOf('TODO:') + 5)}\n`
    const source_md = `- Source: \`${file_name}\`\n`
    const line_number_md = `- Line Number: ${line_number},`
    const mdString = header.concat(source_md).concat(line_number_md)
    TODOS.push(mdString)
  }
}

async function run_todo_test(file_name) {
  const file = fs.readFileSync(file_name, 'utf8')
  file.split(/\r?\n/).forEach((line, line_number) => {
    check_comment_and_append_todo(line, line_number, file_name)
  })
}

function main() {
  walk(process.cwd(), async function (err, results) {
    if (err) throw err
    await results.forEach(async (file_name) => {
      await run_todo_test(file_name)
    })
    generate_md_string_and_write()
  })
}

main()
