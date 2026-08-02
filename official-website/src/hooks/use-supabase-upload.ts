/**
 * useSupabaseUpload - Supabase Storage 文件上传 Hook
 *
 * 封装 react-dropzone 与 Supabase Storage 的上传逻辑，提供：
 * - 拖拽/选择文件
 * - MIME 类型过滤
 * - 文件大小限制
 * - 文件数量限制
 * - 上传进度与错误处理
 * - 部分上传成功重试
 *
 * 使用方式：
 * ```tsx
 * const uploadProps = useSupabaseUpload({
 *   bucketName: 'my-bucket',
 *   path: 'uploads',
 *   maxFileSize: 10 * 1024 * 1024, // 10MB
 *   maxFiles: 5,
 *   supabase: supabaseClient,
 * })
 * ```
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { type FileError, type FileRejection, useDropzone } from 'react-dropzone'
import {type SupabaseClient} from '@supabase/supabase-js'

/** 扩展 File 类型，添加预览 URL 和错误信息 */
interface FileWithPreview extends File {
  preview?: string
  errors: readonly FileError[]
}

/** useSupabaseUpload 的配置选项 */
type UseSupabaseUploadOptions = {
  /**
   * Supabase Storage 中的存储桶名称
   */
  bucketName: string
  /**
   * 上传目标文件夹路径
   *
   * 默认为存储桶根目录
   *
   * 例如：指定 `test` 后，文件将上传为 `test/file_name`
   */
  path?: string
  /**
   * 允许的 MIME 类型列表（如 `image/png`、`text/html`），支持通配符（如 `image/*`）
   *
   * 默认允许所有 MIME 类型
   */
  allowedMimeTypes?: string[]
  /**
   * 每个文件的最大上传大小（字节）
   */
  maxFileSize?: number
  /**
   * 每次上传允许的最大文件数
   */
  maxFiles?: number
  /**
   * 浏览器和 Supabase CDN 缓存时间（秒）
   *
   * 设置在 Cache-Control: max-age=<seconds> 头中。默认 3600 秒。
   */
  cacheControl?: number
  /**
   * 是否覆盖已存在的文件
   *
   * - true：覆盖已存在的文件
   * - false：文件已存在时抛出错误。默认 `false`
   */
  upsert?: boolean

  /**
   * 已初始化的 Supabase 客户端实例
   */
  supabase: SupabaseClient
}

type UseSupabaseUploadReturn = ReturnType<typeof useSupabaseUpload>

/**
 * Supabase Storage 文件上传 Hook
 *
 * 管理文件选择、验证、上传全流程状态
 */
const useSupabaseUpload = (options: UseSupabaseUploadOptions) => {
  const {
    bucketName,
    path,
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = 1,
    cacheControl = 3600,
    upsert = false,
    supabase
  } = options

  // 已选文件列表（含预览 URL 和错误信息）
  const [files, setFiles] = useState<FileWithPreview[]>([])
  // 上传进行中标志
  const [loading, setLoading] = useState<boolean>(false)
  // 上传错误列表
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([])
  // 上传成功的文件名列表
  const [successes, setSuccesses] = useState<string[]>([])

  /** 判断是否全部上传成功：无错误 && 成功数等于文件数 */
  const isSuccess = useMemo(() => {
    if (errors.length === 0 && successes.length === 0) {
      return false
    }
    if (errors.length === 0 && successes.length === files.length) {
      return true
    }
    return false
  }, [errors.length, successes.length, files.length])

  /**
   * 文件拖放/选择回调
   * 处理有效文件和被拒绝文件，生成预览 URL
   */
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // 过滤掉已存在的同名文件
      const validFiles = acceptedFiles
        .filter((file) => !files.find((x) => x.name === file.name))
        .map((file) => {
          ;(file as FileWithPreview).preview = URL.createObjectURL(file)
          ;(file as FileWithPreview).errors = []
          return file as FileWithPreview
        })

      // 被拒绝的文件（MIME 不匹配、超出大小等）
      const invalidFiles = fileRejections.map(({ file, errors }) => {
        ;(file as FileWithPreview).preview = URL.createObjectURL(file)
        ;(file as FileWithPreview).errors = errors
        return file as FileWithPreview
      })

      const newFiles = [...files, ...validFiles, ...invalidFiles]

      setFiles(newFiles)
    },
    [files, setFiles]
  )

  /** react-dropzone 属性：禁用点击（由 DropzoneEmptyState 手动触发） */
  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    accept: allowedMimeTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    maxFiles: maxFiles,
    multiple: maxFiles !== 1,
  })

  /**
   * 上传文件到 Supabase Storage
   * 支持部分失败重试：再次点击只上传之前失败的文件
   */
  const onUpload = useCallback(async () => {
    setLoading(true)

    // 支持部分成功重试：如果之前有失败的文件，再次上传时只上传失败的文件
    const filesWithErrors = errors.map((x) => x.name)
    const filesToUpload =
      filesWithErrors.length > 0
        ? [
            ...files.filter((f) => filesWithErrors.includes(f.name)),
            ...files.filter((f) => !successes.includes(f.name)),
          ]
        : files

    // 并行上传所有文件
    const responses = await Promise.all(
      filesToUpload.map(async (file) => {
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(!!path ? `${path}/${file.name}` : file.name, file, {
            cacheControl: cacheControl.toString(),
            upsert,
          })
        if (error) {
          return { name: file.name, message: error.message }
        } else {
          return { name: file.name, message: undefined }
        }
      })
    )

    // 分离成功和失败的响应
    const responseErrors = responses.filter((x) => x.message !== undefined)
    // 覆盖之前的错误（因为重试了）
    setErrors(responseErrors)

    const responseSuccesses = responses.filter((x) => x.message === undefined)
    const newSuccesses = Array.from(
      new Set([...successes, ...responseSuccesses.map((x) => x.name)])
    )
    setSuccesses(newSuccesses)

    setLoading(false)
  }, [files, path, bucketName, errors, successes])

  /**
   * 副作用：文件列表变化时的清理和验证
   * - 文件列表为空时清除错误
   * - 文件数未超限时移除 "too-many-files" 错误
   */
  useEffect(() => {
    if (files.length === 0) {
      setErrors([])
    }

    // 如果文件数未超过 maxFiles，移除每个文件上的 "too-many-files" 错误
    if (files.length <= maxFiles) {
      let changed = false
      const newFiles = files.map((file) => {
        if (file.errors.some((e) => e.code === 'too-many-files')) {
          file.errors = file.errors.filter((e) => e.code !== 'too-many-files')
          changed = true
        }
        return file
      })
      if (changed) {
        setFiles(newFiles)
      }
    }
  }, [files.length, setFiles, maxFiles])

  return {
    files,
    setFiles,
    successes,
    isSuccess,
    loading,
    errors,
    setErrors,
    onUpload,
    maxFileSize: maxFileSize,
    maxFiles: maxFiles,
    allowedMimeTypes,
    ...dropzoneProps,
  }
}

export { useSupabaseUpload, type UseSupabaseUploadOptions, type UseSupabaseUploadReturn }
