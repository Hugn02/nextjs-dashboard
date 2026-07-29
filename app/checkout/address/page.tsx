// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { User } from "@/src/features/auth/types/auth.types";
// import {
//   getUserLocations,
//   createUserLocation,
//   updateUserLocation,
//   deleteUserLocation,
//   setDefaultLocation,
// } from "@/src/features/location/services/location.service";
// import type { UserLocation, CreateUserLocationDto } from "@/src/features/location/types/location.types";
// import AddressFormModal from "@/src/features/location/components/AddressFormModal";

// const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };

// export default function CheckoutAddressPage() {
//   const router = useRouter();

//   const [user, setUser] = useState<User | null>(null);
//   const [locations, setLocations] = useState<UserLocation[]>([]);
//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editTarget, setEditTarget] = useState<UserLocation | undefined>();
//   const [actionError, setActionError] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState<string | null>(null);
//   const [settingDefault, setSettingDefault] = useState<string | null>(null);

//   // Check auth và load locations
//   useEffect(() => {
//     const savedUser = localStorage.getItem("user");
//     if (!savedUser) {
//       // Phương án B: chưa login → redirect về login
//       router.replace("/");
//       return;
//     }
//     try {
//       const currentUser = JSON.parse(savedUser) as User;
//       setUser(currentUser);
//     } catch {
//       router.replace("/");
//       return;
//     }

//     // Load user locations
//     getUserLocations()
//       .then((data) => {
//         setLocations(data);
//         // Chọn sẵn địa chỉ mặc định hoặc địa chỉ đầu tiên
//         const def = data.find((l) => l.isDefault) ?? data[0];
//         if (def) setSelectedId(def.id);
//       })
//       .catch(() => {
//         // Nếu lỗi (VD: session hết hạn), apiClient tự redirect
//         setLocations([]);
//       })
//       .finally(() => setLoading(false));
//   }, [router]);

//   const handleContinue = () => {
//     if (!selectedId) return;
//     const chosen = locations.find((l) => l.id === selectedId);
//     if (!chosen) return;
//     localStorage.setItem("checkout_selected_location", JSON.stringify(chosen));
//     router.push("/checkout");
//   };

//   const handleDelete = async (loc: UserLocation) => {
//     if (loc.isDefault) {
//       setActionError("Không thể xóa địa chỉ mặc định. Hãy đặt địa chỉ khác làm mặc định trước.");
//       return;
//     }
//     if (!window.confirm(`Xóa địa chỉ "${loc.label}"?`)) return;
//     setDeleting(loc.id);
//     setActionError(null);
//     try {
//       await deleteUserLocation(loc.id);
//       const updated = locations.filter((l) => l.id !== loc.id);
//       setLocations(updated);
//       if (selectedId === loc.id) {
//         const newDef = updated.find((l) => l.isDefault) ?? updated[0];
//         setSelectedId(newDef?.id ?? null);
//       }
//     } catch (err: any) {
//       setActionError(err.message || "Xóa thất bại.");
//     } finally {
//       setDeleting(null);
//     }
//   };

//   const handleSetDefault = async (loc: UserLocation) => {
//     setSettingDefault(loc.id);
//     setActionError(null);
//     try {
//       await setDefaultLocation(loc.id);
//       setLocations((prev) =>
//         prev.map((l) => ({ ...l, isDefault: l.id === loc.id }))
//       );
//     } catch (err: any) {
//       setActionError(err.message || "Cập nhật thất bại.");
//     } finally {
//       setSettingDefault(null);
//     }
//   };

//   const handleFormSubmit = async (dto: CreateUserLocationDto) => {
//     if (editTarget) {
//       const updated = await updateUserLocation(editTarget.id, dto);
//       setLocations((prev) =>
//         prev.map((l) => (l.id === updated.id ? updated : l))
//       );
//     } else {
//       const created = await createUserLocation(dto);
//       setLocations((prev) => [...prev, created]);
//       setSelectedId(created.id);
//     }
//     setShowForm(false);
//     setEditTarget(undefined);
//   };

//   if (!user || loading) {
//     return (
//       <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-10 h-10 border-2 border-[#c4a84f] border-t-transparent rounded-full animate-spin" />
//           <p className="text-sm text-gray-400" style={serif}>
//             Đang tải...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#faf8f5]">
//       {/* Brand logo bar */}
//       <div className="bg-white border-b border-[#ede0c4] py-4 text-center">
//         <Link href="/">
//           <img
//             src="/assets/logo2.png"
//             alt="Bát Tràng"
//             className="h-10 md:h-12 w-auto mx-auto object-contain"
//           />
//         </Link>
//       </div>

//       <div className="max-w-[680px] mx-auto py-8 px-4 md:px-8">
//         <div className="bg-white border border-[#ede0c4] rounded-lg p-6 shadow-sm">
//           {/* Breadcrumb */}
//           <nav className="flex flex-wrap items-center gap-y-1 text-[10px] sm:text-xs text-gray-500 mb-5 font-['Cormorant_Garamond',_serif] uppercase tracking-[0.8px] sm:tracking-[1.5px]">
//             <Link
//               href="/cart"
//               className="hover:underline text-[#8b6914] no-underline whitespace-nowrap"
//             >
//               Giỏ hàng
//             </Link>
//             <span className="mx-1.5 text-gray-400">›</span>
//             <span className="text-gray-800 font-medium whitespace-nowrap">
//               Địa chỉ nhận hàng
//             </span>
//             <span className="mx-1.5 text-gray-400">›</span>
//             <span className="text-gray-400 whitespace-nowrap">
//               Thông tin giao hàng
//             </span>
//           </nav>

//           <h2
//             className="text-base sm:text-xl font-bold font-['Cormorant_Garamond',_serif] tracking-[1px] sm:tracking-[1.5px] uppercase text-[#2c1a00] pb-3 border-b border-[#f3ebdb] mb-5"
//           >
//             Địa Chỉ Nhận Hàng
//           </h2>

//           {actionError && (
//             <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded p-3">
//               {actionError}
//             </div>
//           )}

//           {/* Danh sách địa chỉ */}
//           {locations.length === 0 ? (
//             <div className="text-center py-8">
//               <div className="text-5xl mb-4 opacity-30">📍</div>
//               <p className="text-gray-500 text-sm mb-6" style={serif}>
//                 Bạn chưa có địa chỉ nhận hàng nào.
//                 <br />
//                 Vui lòng thêm địa chỉ để tiếp tục đặt hàng.
//               </p>
//               <button
//                 onClick={() => {
//                   setEditTarget(undefined);
//                   setShowForm(true);
//                   setActionError(null);
//                 }}
//                 className="inline-flex items-center gap-2 bg-[#c4a84f] text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#a8893a] transition-colors"
//                 style={serif}
//               >
//                 <span className="text-base leading-none">+</span>
//                 Thêm Địa Chỉ Mới
//               </button>
//             </div>
//           ) : (
//             <div className="flex flex-col gap-3">
//               {locations.map((loc) => (
//                 <div
//                   key={loc.id}
//                   onClick={() => setSelectedId(loc.id)}
//                   className={`flex gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-150 ${selectedId === loc.id
//                       ? "border-[#e4393c] bg-[#fff8f8]"
//                       : "border-[#ede0c4] hover:border-[#c4a84f] bg-white"
//                     }`}
//                 >
//                   {/* Radio */}
//                   <div className="pt-0.5 flex-shrink-0">
//                     <div
//                       className={`rounded-full border-2 flex items-center justify-center transition-colors ${selectedId === loc.id
//                           ? "border-[#e4393c]"
//                           : "border-gray-400"
//                         }`}
//                       style={{ width: 18, height: 18 }}
//                     >
//                       {selectedId === loc.id && (
//                         <div
//                           className="rounded-full bg-[#e4393c]"
//                           style={{ width: 9, height: 9 }}
//                         />
//                       )}
//                     </div>
//                   </div>

//                   {/* Info */}
//                   <div className="flex-1 min-w-0">
//                     <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
//                       <span className="font-semibold text-[#2c1a00] text-sm">
//                         {loc.receiverName}
//                       </span>
//                       <span className="text-gray-400 text-xs">|</span>
//                       <span className="text-gray-600 text-sm">{loc.phone}</span>
//                     </div>
//                     <p className="text-xs text-gray-500 leading-relaxed">
//                       {loc.address}
//                       <br />
//                       {loc.wardName}, {loc.districtName}, {loc.provinceName}
//                     </p>
//                     <div className="flex flex-wrap items-center gap-2 mt-2">
//                       {loc.isDefault && (
//                         <span className="inline-block border border-[#e4393c] text-[#e4393c] text-[10px] px-1.5 py-0.5 rounded font-semibold">
//                           Mặc định
//                         </span>
//                       )}
//                       <span className="inline-block bg-[#f3ebdb] text-[#8b6914] text-[10px] px-1.5 py-0.5 rounded">
//                         {loc.label}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div
//                     className="flex flex-col gap-1.5 flex-shrink-0 items-end"
//                     onClick={(e) => e.stopPropagation()}
//                   >
//                     <button
//                       onClick={() => {
//                         setEditTarget(loc);
//                         setShowForm(true);
//                         setActionError(null);
//                       }}
//                       className="text-xs text-[#c4a84f] hover:text-[#a8893a] hover:underline font-semibold transition-colors"
//                     >
//                       Cập nhật
//                     </button>
//                     {!loc.isDefault && (
//                       <>
//                         <button
//                           onClick={() => handleSetDefault(loc)}
//                           disabled={settingDefault === loc.id}
//                           className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-semibold transition-colors disabled:opacity-50"
//                         >
//                           {settingDefault === loc.id
//                             ? "Đang đặt..."
//                             : "Đặt mặc định"}
//                         </button>
//                         <button
//                           onClick={() => handleDelete(loc)}
//                           disabled={deleting === loc.id}
//                           className="text-xs text-red-400 hover:text-red-600 hover:underline font-semibold transition-colors disabled:opacity-50"
//                         >
//                           {deleting === loc.id ? "Đang xóa..." : "Xóa"}
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))}

//               {/* Add new */}
//               <button
//                 onClick={() => {
//                   setEditTarget(undefined);
//                   setShowForm(true);
//                   setActionError(null);
//                 }}
//                 className="flex items-center justify-center gap-2 py-3.5 rounded-lg border-2 border-dashed border-[#c4a84f] text-[#c4a84f] text-xs font-bold uppercase tracking-wider hover:bg-[#fffdf7] transition-colors mt-1"
//                 style={serif}
//               >
//                 <span className="text-lg leading-none">+</span>
//                 Thêm Địa Chỉ Mới
//               </button>
//             </div>
//           )}

//           {/* Navigation */}
//           <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 border-t border-[#f3ebdb] pt-6">
//             <Link
//               href="/cart"
//               className="text-xs font-bold tracking-[1.5px] uppercase text-[#8b6914] no-underline hover:underline font-['Cormorant_Garamond',_serif]"
//             >
//               ‹ Quay về giỏ hàng
//             </Link>
//             <button
//               onClick={handleContinue}
//               disabled={!selectedId}
//               className="w-full sm:w-auto bg-[#c4a84f] text-white px-8 py-3.5 hover:bg-[#a8893a] transition-colors text-xs font-bold tracking-[2px] uppercase font-['Cormorant_Garamond',_serif] rounded disabled:opacity-40 disabled:cursor-not-allowed"
//             >
//               Tiếp tục →
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Address form modal */}
//       {showForm && (
//         <AddressFormModal
//           editData={editTarget}
//           onClose={() => {
//             setShowForm(false);
//             setEditTarget(undefined);
//           }}
//           onSubmit={handleFormSubmit}
//         />
//       )}
//     </div>
//   );
// }
