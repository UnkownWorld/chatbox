import { CHATBOX_BUILD_TARGET, CHATBOX_BUILD_PLATFORM } from '@/variables'
import DesktopPlatform from './desktop_platform'
import type { Platform } from './interfaces'
import TestPlatform from './test_platform'
import WebPlatform from './web_platform'

// 移动端平台实现
class MobilePlatform extends WebPlatform {
  public type: 'mobile' = 'mobile'
  
  public async getPlatform(): Promise<string> {
    return CHATBOX_BUILD_PLATFORM || 'mobile'
  }
}

function initPlatform(): Platform {
  // 测试环境使用 TestPlatform
  if (process.env.NODE_ENV === 'test') {
    return new TestPlatform()
  }
  
  // 移动端检测
  if (CHATBOX_BUILD_TARGET === 'mobile_app') {
    return new MobilePlatform()
  }
  
  // 桌面端检测
  if (typeof window !== 'undefined' && window.electronAPI) {
    return new DesktopPlatform(window.electronAPI)
  }
  
  // Web端
  return new WebPlatform()
}

export default initPlatform()
