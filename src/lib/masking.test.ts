// masking 유틸 단위 테스트 — 함수당 5건씩
import { describe, it, expect } from 'vitest'
import { maskBizNo, maskRepName, maskAddress } from './masking'

describe('maskBizNo', () => {
  it('10자리 숫자를 중간 마스킹으로 변환', () => {
    expect(maskBizNo('1234567890')).toBe('123-XX-67890')
  })

  it('하이픈이 섞인 입력도 숫자만 추출하여 마스킹', () => {
    expect(maskBizNo('123-45-67890')).toBe('123-XX-67890')
  })

  it('공백이 섞인 입력 정상 처리', () => {
    expect(maskBizNo('123 45 67890')).toBe('123-XX-67890')
  })

  it('10자리 미만이면 입력 그대로 반환', () => {
    expect(maskBizNo('12345')).toBe('12345')
  })

  it('비숫자 입력은 그대로 반환', () => {
    expect(maskBizNo('abcdefghij')).toBe('abcdefghij')
  })
})

describe('maskRepName', () => {
  it('한 글자 성씨 + 한 글자 이름', () => {
    expect(maskRepName('김민')).toBe('김OO')
  })

  it('한 글자 성씨 + 두 글자 이름', () => {
    expect(maskRepName('김철수')).toBe('김OO')
  })

  it('두 글자 복성 (남궁민수) → 복성 + OO', () => {
    expect(maskRepName('남궁민수')).toBe('남궁OO')
  })

  it('한 글자만 있는 입력은 그대로', () => {
    expect(maskRepName('김')).toBe('김')
  })

  it('영문 이름은 변환 없이 반환', () => {
    expect(maskRepName('John Doe')).toBe('John Doe')
  })
})

describe('maskAddress', () => {
  it('번지·호수가 포함된 풀 주소 → 동까지만', () => {
    expect(maskAddress('부산광역시 연제구 거제동 1234-5 OO빌라 101호'))
      .toBe('부산광역시 연제구 거제동')
  })

  it('동까지만 있는 주소는 그대로', () => {
    expect(maskAddress('부산광역시 연제구 거제동')).toBe('부산광역시 연제구 거제동')
  })

  it('읍이 포함된 주소', () => {
    expect(maskAddress('경상남도 양산시 물금읍 가촌리 555-1')).toBe('경상남도 양산시 물금읍')
  })

  it('도로명 주소는 도로명까지만', () => {
    expect(maskAddress('부산광역시 해운대구 마린시티1로 12-3')).toBe('부산광역시 해운대구 마린시티1로')
  })

  it('빈 문자열은 빈 문자열로', () => {
    expect(maskAddress('')).toBe('')
  })
})
