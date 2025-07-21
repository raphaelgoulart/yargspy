import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import type { HTMLAttributes } from 'react'

// Language syntax highlight must be declared here first for light module import
SyntaxHighlighter.registerLanguage('js', js)
SyntaxHighlighter.registerLanguage('json', json)

export interface BlockOfCodeProps extends HTMLAttributes<HTMLElement> {
  code: string
}
export default function BlockOfCode({ code, ...props }: BlockOfCodeProps) {
  return (
    <SyntaxHighlighter language="json" style={a11yDark} codeTagProps={props}>
      {code}
    </SyntaxHighlighter>
  )
}
