// Convert number to Vietnamese words for invoice currency total
export function readNumberToVietnamese(num: number): string {
  if (!num || num === 0) return 'Không đồng'

  const defaultNumbers = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']

  function readTriple(number: number): string {
    let hundred = Math.floor(number / 100)
    let ten = Math.floor((number % 100) / 10)
    let unit = number % 10
    let result = ''

    if (hundred > 0) {
      result += defaultNumbers[hundred] + ' trăm '
    }

    if (ten > 1) {
      result += defaultNumbers[ten] + ' mươi '
      if (unit === 1) result += 'mốt '
      else if (unit === 5) result += 'lăm '
      else if (unit > 0) result += defaultNumbers[unit] + ' '
    } else if (ten === 1) {
      result += 'mười '
      if (unit === 1) result += 'mốt '
      else if (unit === 5) result += 'lăm '
      else if (unit > 0) result += defaultNumbers[unit] + ' '
    } else if (ten === 0 && unit > 0) {
      if (hundred > 0) result += 'lẻ '
      if (unit === 5) result += 'năm '
      else result += defaultNumbers[unit] + ' '
    }

    return result
  }

  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ']
  let strNum = Math.floor(num).toString()
  let arr: number[] = []

  while (strNum.length > 0) {
    arr.push(parseInt(strNum.substring(Math.max(0, strNum.length - 3))))
    strNum = strNum.substring(0, Math.max(0, strNum.length - 3))
  }

  let result = ''
  for (let j = arr.length - 1; j >= 0; j--) {
    if (arr[j] > 0) {
      result += readTriple(arr[j]) + units[j] + ' '
    }
  }

  result = result.trim()
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng'
  } else {
    result = 'Không đồng'
  }

  return result
}

export interface InvoiceOrderData {
  _id?: string
  id?: string
  publicId: string
  customerName?: string
  phone?: string
  email?: string
  address?: string
  province?: string
  district?: string
  ward?: string
  note?: string
  total: number
  shippingFee?: number
  createdAt: string
  items: Array<{
    product?: {
      productName?: string
      sku?: string
    }
    productName?: string
    quantity: number
    price: number
  }>
}

export async function downloadOrderInvoicePdf(order: InvoiceOrderData): Promise<void> {
  const formatPrice = (n: number) => {
    return (n || 0).toLocaleString('vi-VN') + ' ₫'
  }

  const dateObj = order?.createdAt ? new Date(order.createdAt) : new Date()
  const day = dateObj.getDate()
  const month = dateObj.getMonth() + 1
  const year = dateObj.getFullYear()

  const fullAddress = [order.address, order.ward, order.district, order.province]
    .filter(Boolean)
    .join(', ') || 'Chưa cập nhật'

  const items = order.items || []
  const totalMinRows = 8
  const emptyRowsCount = Math.max(0, totalMinRows - items.length)

  // Create temporary offscreen container sized specifically for A4 PDF (680px fits comfortably inside 190mm)
  const container = document.createElement('div')
  container.style.backgroundColor = '#ffffff'
  container.style.color = '#1e293b'
  container.style.padding = '20px 24px'
  container.style.width = '680px'
  container.style.fontFamily = 'Arial, Helvetica, sans-serif'
  container.style.boxSizing = 'border-box'

  container.innerHTML = `
    <!-- BRAND & HEADER TITLE -->
    <div style="text-align: center; margin-bottom: 14px;">
      <h1 style="font-size: 20px; font-weight: bold; color: #dc2626; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 2px 0;">
        HÓA ĐƠN BÁN HÀNG
      </h1>
      <p style="font-size: 10px; color: #475569; font-style: italic; margin: 0 0 2px 0;">
        Gốm Sứ Nghệ Nhân Bát Tràng | Hotline: 0988 123 456
      </p>
      <p style="font-size: 10px; color: #64748b; margin: 0;">
        Mã ĐH: <strong style="color: #0f172a;">${order.publicId || order._id}</strong>
      </p>
    </div>

    <!-- CUSTOMER INFO -->
    <div style="margin-bottom: 14px; font-size: 12px; color: #1e293b;">
      <div style="display: flex; align-items: baseline; margin-bottom: 4px;">
        <span style="font-weight: bold; color: #dc2626; min-width: 110px;">Tên khách hàng:</span>
        <span style="font-weight: 600; color: #0f172a; border-bottom: 1px dotted #94a3b8; flex: 1; padding-left: 6px; padding-bottom: 2px;">
          ${order.customerName || 'Khách hàng'}
        </span>
      </div>

      <div style="display: flex; align-items: baseline; margin-bottom: 4px;">
        <span style="font-weight: bold; color: #dc2626; min-width: 110px;">Số điện thoại:</span>
        <span style="font-weight: 600; color: #0f172a; border-bottom: 1px dotted #94a3b8; flex: 1; padding-left: 6px; padding-bottom: 2px;">
          ${order.phone || '—'}
        </span>
      </div>

      <div style="display: flex; align-items: baseline; margin-bottom: 4px;">
        <span style="font-weight: bold; color: #dc2626; min-width: 110px;">Địa chỉ:</span>
        <span style="font-weight: 500; color: #1e293b; border-bottom: 1px dotted #94a3b8; flex: 1; padding-left: 6px; padding-bottom: 2px;">
          ${fullAddress}
        </span>
      </div>

      ${
        order.note
          ? `
      <div style="display: flex; align-items: baseline; margin-bottom: 4px;">
        <span style="font-weight: bold; color: #dc2626; min-width: 110px;">Ghi chú:</span>
        <span style="font-style: italic; color: #334155; border-bottom: 1px dotted #94a3b8; flex: 1; padding-left: 6px; padding-bottom: 2px;">
          ${order.note}
        </span>
      </div>`
          : ''
      }
    </div>

    <!-- TRADITIONAL RED TABLE -->
    <div style="margin-bottom: 12px; border: 2px solid #dc2626; border-radius: 8px; overflow: hidden;">
      <table style="width: 100%; font-size: 11px; text-align: left; border-collapse: collapse; table-layout: fixed;">
        <colgroup>
          <col style="width: 40px;" />
          <col style="width: 250px;" />
          <col style="width: 60px;" />
          <col style="width: 110px;" />
          <col style="width: 120px;" />
        </colgroup>
        <thead>
          <tr style="border-bottom: 2px solid #dc2626; color: #dc2626; font-weight: bold; text-align: center; background: #fef2f2;">
            <th style="padding: 6px 4px; border-right: 2px solid #dc2626; text-align: center;">STT</th>
            <th style="padding: 6px 8px; border-right: 2px solid #dc2626; text-align: center;">Tên hàng</th>
            <th style="padding: 6px 4px; border-right: 2px solid #dc2626; text-align: center;">SL</th>
            <th style="padding: 6px 8px; border-right: 2px solid #dc2626; text-align: center;">Đơn giá</th>
            <th style="padding: 6px 8px; text-align: center;">Thành tiền</th>
          </tr>
        </thead>
        <tbody style="color: #1e293b;">
          ${items
            .map((item, idx) => {
              const name = item.product?.productName || item.productName || 'Sản phẩm gốm sứ'
              return `
              <tr style="border-bottom: 1px dotted #cbd5e1; page-break-inside: avoid;">
                <td style="padding: 5px; textAlign: center; border-right: 2px solid #dc2626; font-weight: 500; color: #dc2626; text-align: center;">
                  ${idx + 1}
                </td>
                <td style="padding: 5px 8px; border-right: 2px solid #dc2626; font-weight: 600; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${name}
                </td>
                <td style="padding: 5px; textAlign: center; border-right: 2px solid #dc2626; font-weight: bold; text-align: center;">
                  ${item.quantity}
                </td>
                <td style="padding: 5px 8px; text-align: right; border-right: 2px solid #dc2626;">
                  ${formatPrice(item.price)}
                </td>
                <td style="padding: 5px 8px; text-align: right; font-weight: bold; color: #0f172a;">
                  ${formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            `
            })
            .join('')}

          ${Array.from({ length: emptyRowsCount })
            .map(
              (_, idx) => `
            <tr style="border-bottom: 1px dotted #cbd5e1; height: 22px;">
              <td style="padding: 4px; text-align: center; border-right: 2px solid #dc2626; color: #dc2626;">
                ${items.length + idx + 1}
              </td>
              <td style="padding: 4px 8px; border-right: 2px solid #dc2626;"></td>
              <td style="padding: 4px; border-right: 2px solid #dc2626;"></td>
              <td style="padding: 4px 8px; border-right: 2px solid #dc2626;"></td>
              <td style="padding: 4px 8px;"></td>
            </tr>
          `
            )
            .join('')}

          <tr style="border-top: 2px solid #dc2626; font-weight: bold; color: #dc2626; background: #fff5f5;">
            <td colSpan="4" style="padding: 6px 10px; text-align: center; border-right: 2px solid #dc2626; font-size: 12px;">
              Tổng cộng:
            </td>
            <td style="padding: 6px 8px; text-align: right; font-size: 12px; font-weight: bold; color: #dc2626;">
              ${formatPrice(order.total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- AMOUNT IN WORDS -->
    <div style="margin-bottom: 14px; font-size: 11px;">
      <div style="display: flex; align-items: baseline;">
        <span style="font-weight: bold; color: #dc2626; min-width: 140px;">Thành tiền (bằng chữ):</span>
        <span style="font-style: italic; font-weight: 600; color: #1e293b; border-bottom: 1px dotted #94a3b8; flex: 1; padding-left: 6px; padding-bottom: 2px;">
          ${readNumberToVietnamese(order.total)}
        </span>
      </div>
    </div>

    <!-- DATE & SIGNATURES -->
    <div style="margin-top: 14px;">
      <div style="text-align: right; font-size: 10px; color: #334155; font-style: italic; padding-right: 12px; margin-bottom: 8px;">
        Ngày ${day < 10 ? `0${day}` : day} tháng ${month < 10 ? `0${month}` : month} năm ${year}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; text-align: center; font-size: 11px;">
        <div>
          <p style="font-weight: bold; color: #dc2626; margin: 0 0 2px 0;">Người mua hàng</p>
          <p style="font-size: 9px; font-style: italic; color: #94a3b8; margin: 0 0 4px 0;">(Ký, ghi rõ họ tên)</p>
          <div style="height: 30px;"></div>
          <p style="font-weight: 600; color: #334155; margin: 0; font-size: 11px;">${order.customerName || ''}</p>
        </div>
        <div>
          <p style="font-weight: bold; color: #dc2626; margin: 0 0 2px 0;">Người bán hàng</p>
          <p style="font-size: 9px; font-style: italic; color: #94a3b8; margin: 0 0 2px 0;">(Đã ký)</p>
          <div style="height: 30px; display: flex; align-items: center; justify-content: center;">
            <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; font-weight: bold; font-style: italic; color: #dc2626; letter-spacing: 1px;">
              Bát Tràng
            </span>
          </div>
          <p style="font-weight: bold; color: #0f172a; margin: 0; font-size: 11px;">
            Nghệ Nhân Bát Tràng
          </p>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(container)

  try {
    const html2pdf = (await import('html2pdf.js')).default
    const opt = {
      margin: [8, 8, 8, 8] as [number, number, number, number],
      filename: `Hoa_Don_${order.publicId || order._id}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, logging: false, width: 680 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    }

    await html2pdf().set(opt).from(container).save()
  } finally {
    document.body.removeChild(container)
  }
}
