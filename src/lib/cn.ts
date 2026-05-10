// className 병합 유틸 — clsx로 조건 합치고 tailwind-merge로 중복 클래스 정리
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
