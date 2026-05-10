// Tabs 기본 렌더 테스트 — 활성 탭 콘텐츠만 표시되는지
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

describe('Tabs', () => {
  it('renders only the active tab content', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">패널 A</TabsContent>
        <TabsContent value="b">패널 B</TabsContent>
      </Tabs>,
    )
    expect(screen.getByText('패널 A')).toBeInTheDocument()
    expect(screen.queryByText('패널 B')).not.toBeInTheDocument()
  })
})
