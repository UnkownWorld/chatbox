import { CHATBOX_BUILD_TARGET, CHATBOX_BUILD_PLATFORM } from '@/variables'
import DesktopPlatform from './desktop_platform'
import type { Platform } from './interfaces'
import TestPlatform from './test_platform'
import WebPlatform from './web_platform'
import { IndexedDBStorage } from './storages'
import WebExporter from './web_exporter'
import webLogger from './web_logger'
import { IndexedDBImageGenerationStorage, type ImageGenerationStorage } from '@/storage/ImageGenerationStorage'
import { getBrowser, getOS } from '../packages/navigator'
import { parseLocale } from '@/i18n/parser'
import type { Config, Settings, ShortcutSetting } from '@shared/types'
import * as defaults from '@shared/defaults'
import localforage from 'localforage'
import { parseTextFileLocally } from './web_platform_utils'
import type { KnowledgeBaseController } from './knowledge-base/interface'

// 移动端平台实现 - 使用 IndexedDB 存储（更可靠）
class MobilePlatform extends IndexedDBStorage implements Platform {
  public type: 'mobile' = 'mobile'
  public exporter = new WebExporter()
  private imageGenerationStorage: ImageGenerationStorage | null = null

  constructor() {
    super()
    console.log('[MobilePlatform] Initializing with IndexedDB storage')
    webLogger.init().catch((e) => console.error('Failed to init web logger:', e))
  }

  public async getVersion(): Promise<string> {
    return 'mobile'
  }
  
  public async getPlatform(): Promise<string> {
    return CHATBOX_BUILD_PLATFORM || 'android'
  }
  
  public async getArch(): Promise<string> {
    return 'mobile'
  }
  
  public async shouldUseDarkColors(): Promise<boolean> {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  public onSystemThemeChange(callback: () => void): () => void {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', callback)
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', callback)
    }
  }
  
  public onWindowShow(callback: () => void): () => void {
    return () => null
  }
  
  public onWindowFocused(callback: () => void): () => void {
    return () => null
  }
  
  public onUpdateDownloaded(callback: () => void): () => void {
    return () => null
  }
  
  public async openLink(url: string): Promise<void> {
    window.open(url)
  }
  
  public async getDeviceName(): Promise<string> {
    return await Promise.resolve(getBrowser() || 'mobile')
  }
  
  public async getInstanceName(): Promise<string> {
    return `${getOS()} / ${getBrowser()}`
  }
  
  public async getLocale() {
    const lang = window.navigator.language
    return parseLocale(lang)
  }
  
  public async ensureShortcutConfig(config: ShortcutSetting): Promise<void> {
    return
  }
  
  public async ensureProxyConfig(config: { proxy?: string }): Promise<void> {
    return
  }
  
  public async relaunch(): Promise<void> {
    location.reload()
  }

  public async getConfig(): Promise<Config> {
    let value: Config = await this.getStoreValue('configs')
    if (value === undefined || value === null) {
      value = defaults.newConfigs()
      await this.setStoreValue('configs', value)
    }
    return value
  }
  
  public async getSettings(): Promise<Settings> {
    let value: Settings = await this.getStoreValue('settings')
    if (value === undefined || value === null) {
      value = defaults.settings()
      await this.setStoreValue('settings', value)
    }
    return value
  }

  public async getStoreBlob(key: string): Promise<string | null> {
    return localforage.getItem<string>(key)
  }
  
  public async setStoreBlob(key: string, value: string): Promise<void> {
    await localforage.setItem(key, value)
  }
  
  public async delStoreBlob(key: string) {
    return localforage.removeItem(key)
  }
  
  public async listStoreBlobKeys(): Promise<string[]> {
    return localforage.keys()
  }

  public async initTracking() {
    const GAID = 'G-B365F44W6E'
    try {
      const conf = await this.getConfig()
      window.gtag('config', GAID, {
        app_name: 'chatbox',
        user_id: conf.uuid,
        client_id: conf.uuid,
        app_version: await this.getVersion(),
        chatbox_platform_type: 'mobile',
        chatbox_platform: await this.getPlatform(),
        app_platform: await this.getPlatform(),
      })
    } catch (e) {
      window.gtag('config', GAID, {
        app_name: 'chatbox',
      })
    }
  }
  
  public trackingEvent(name: string, params: { [key: string]: string }) {
    window.gtag('event', name, params)
  }

  public async shouldShowAboutDialogWhenStartUp(): Promise<boolean> {
    return false
  }

  public async appLog(level: string, message: string): Promise<void> {
    webLogger.log(level, message)
  }

  public async exportLogs(): Promise<string> {
    return webLogger.exportLogs()
  }

  public async clearLogs(): Promise<void> {
    return webLogger.clearLogs()
  }

  public async ensureAutoLaunch(enable: boolean) {
    return
  }

  async parseFileLocally(file: File): Promise<{ key?: string; isSupported: boolean }> {
    const result = await parseTextFileLocally(file)
    if (!result.isSupported) {
      return { isSupported: false }
    }
    const { v4: uuidv4 } = await import('uuid')
    const key = `parseFile-` + uuidv4()
    await this.setStoreBlob(key, result.text)
    return { key, isSupported: true }
  }

  public async isFullscreen() {
    return true
  }

  public async setFullscreen(enabled: boolean): Promise<void> {
    return
  }

  installUpdate(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public getKnowledgeBaseController(): KnowledgeBaseController {
    throw new Error('Method not implemented.')
  }

  public getImageGenerationStorage(): ImageGenerationStorage {
    if (!this.imageGenerationStorage) {
      this.imageGenerationStorage = new IndexedDBImageGenerationStorage()
    }
    return this.imageGenerationStorage
  }

  public minimize() {
    return Promise.resolve()
  }

  public maximize() {
    return Promise.resolve()
  }

  public unmaximize() {
    return Promise.resolve()
  }

  public closeWindow() {
    return Promise.resolve()
  }

  public isMaximized() {
    return Promise.resolve(true)
  }

  public onMaximizedChange() {
    return () => null
  }
}

function initPlatform(): Platform {
  // 测试环境使用 TestPlatform
  if (process.env.NODE_ENV === 'test') {
    return new TestPlatform()
  }
  
  // 移动端检测
  if (CHATBOX_BUILD_TARGET === 'mobile_app') {
    console.log('[Platform] Creating MobilePlatform for mobile_app target')
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
