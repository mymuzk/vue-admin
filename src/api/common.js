import request from '@/utils/request'

export function uploadFile(form) {
  return request.post('/upload', form)
}
