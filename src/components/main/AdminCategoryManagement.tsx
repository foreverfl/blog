import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  addCategoryAsync,
  addClassificationAsync,
  deleteCategoryAsync,
  deleteClassificationAsync,
  fetchClassificationsAndCategories,
  updateCategoryAsync,
  updateClassificationAsync,
} from "@/features/category/categorySlice";
import Modal from "@/components/ui/Modal";

const MainContent: React.FC = () => {
  const dispatch = useAppDispatch();

  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  );

  const { classifications, categories, loading } = useAppSelector(
    (state) => state.category
  );

  useEffect(() => {
    dispatch(fetchClassificationsAndCategories());
  }, [dispatch]);

  // CategoryId & ClassificationId
  const [selectedClassificationId, setSelectedClassificationId] = useState<
    string | null
  >(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const handleClassificationSelect = (id: string) => {
    setSelectedClassificationId(id);
  };

  const handleCategorySelect = (id: string) => {
    setSelectedCategoryId(id);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) => category.classification === selectedClassificationId
    );
  }, [categories, selectedClassificationId]);

  // debug
  // useEffect(() => {
  //   console.log("Selected Classification ID:", selectedClassificationId);
  // }, [selectedClassificationId]);

  // Modal
  type ModalState = {
    isOpen: boolean;
    mode: "add" | "edit" | null;
    dataType: "classification" | "category" | null;
    editingId?: string;
  };

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: null,
    dataType: null,
  });

  const openAddClassificationModal = () =>
    setModalState({
      isOpen: true,
      mode: "add",
      dataType: "classification",
    });

  const openEditClassificationModal = (id: string) =>
    setModalState({
      isOpen: true,
      mode: "edit",
      dataType: "classification",
      editingId: id,
    });

  const openAddCategoryModal = () =>
    setModalState({
      isOpen: true,
      mode: "add",
      dataType: "category",
    });

  const openEditCategoryModal = (id: string) =>
    setModalState({
      isOpen: true,
      mode: "edit",
      dataType: "category",
      editingId: id,
    });

  const closeModal = useCallback(() => {
    setModalState((currentState) => ({ ...currentState, isOpen: false }));
  }, []);

  // Add Classification
  const handleAddClassification = (korean: string, japanese: string) => {
    if (korean && japanese) {
      dispatch(addClassificationAsync({ name_ko: korean, name_ja: japanese }));
    }
  };

  // Edit Classification
  const handleEditClassification = useCallback(
    (korean: string, japanese: string, classificationId: string) => {
      if (korean && japanese) {
        dispatch(
          updateClassificationAsync({
            classificationId,
            name_ko: korean,
            name_ja: japanese,
          })
        );
        closeModal();
      }
    },
    [dispatch, closeModal]
  );

  // Delete Classification
  const handleDeleteClassification = useCallback(
    (classificationId: string) => {
      const confirmDelete = confirm(
        "Do you really want to delete this classification?"
      );
      if (confirmDelete) {
        dispatch(deleteClassificationAsync(classificationId));
      }
    },
    [dispatch]
  );

  // Add Category
  const handleAddCategory = useCallback(
    (name_ko: string, name_ja: string) => {
      if (name_ko && name_ja && selectedClassificationId) {
        dispatch(
          addCategoryAsync({
            classificationId: selectedClassificationId,
            name_ko,
            name_ja,
          })
        );
      }
    },
    [dispatch, selectedClassificationId]
  );

  // Edit Category
  const handleEditCategory = useCallback(
    (name_ko: string, name_ja: string, categoryId: string) => {
      if (name_ko && name_ja && categoryId) {
        dispatch(
          updateCategoryAsync({
            categoryId,
            name_ko,
            name_ja,
          })
        );
        closeModal();
      }
    },
    [dispatch, closeModal]
  );

  // Delete Category
  const handleDeleteCategory = useCallback(
    (categoryId: string) => {
      const confirmDelete = confirm(
        "Do you really want to delete this category?"
      );
      if (confirmDelete && categoryId) {
        dispatch(deleteCategoryAsync(categoryId));
      }
    },
    [dispatch]
  );

  return (
    <div className="flex h-screen my-10">
      {/* 왼쪽 부분: Classifications */}
      <div className="w-1/2 border-r border-gray-200 px-10">
        <div className="flex space-x-6">
          <button
            onClick={openAddClassificationModal}
            className="bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white focus:outline-none p-2 rounded transition-colors duration-150 w-16"
          >
            Add
          </button>
          <button
            onClick={() =>
              selectedClassificationId &&
              openEditClassificationModal(selectedClassificationId)
            }
            className="bg-transparent border border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:outline-none p-2 rounded transition-colors duration-150 w-16"
          >
            Edit
          </button>
          <button
            onClick={() =>
              handleDeleteClassification(selectedClassificationId!)
            }
            className="bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:outline-none p-2 rounded transition-colors duration-150 w-16"
          >
            Delete
          </button>
        </div>

        <h2 className="text-3xl font-bold my-10">Classifications</h2>

        <div className="flex flex-col px-10">
          <div role="group" className="space-y-2">
            {classifications.map((classification, index) => (
              <label
                key={classification._id}
                className="has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-transparent block cursor-pointer text-lg p-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                <input
                  type="radio"
                  id={`vbtn-radio${index}`}
                  name="classification"
                  value={classification._id}
                  onChange={() =>
                    handleClassificationSelect(classification._id)
                  }
                  className="hidden peer" // 숨김 처리
                  autoComplete="off"
                />
                {`${classification.name_ko} / ${classification.name_ja}`}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 오른쪽 부분: Categories */}
      {selectedClassificationId && (
        <div className="w-1/2 border-r border-gray-200 px-10">
          <div className="flex space-x-6">
            <button
              onClick={openAddCategoryModal}
              className="bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white focus:outline-none p-2 rounded transition-colors duration-150 w-16"
            >
              Add
            </button>
            <button
              onClick={() =>
                selectedCategoryId && openEditCategoryModal(selectedCategoryId)
              }
              className="bg-transparent border border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:outline-none p-2 rounded transition-colors duration-150 w-16"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteCategory(selectedCategoryId!)}
              className="bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white focus:outline-none p-2 rounded transition-colors duration-150 w-16"
            >
              Delete
            </button>
          </div>

          <h2 className="text-3xl font-bold my-10">Categories</h2>

          <div className="flex flex-col space-y-2">
            {filteredCategories.map((category, index) => (
              <label
                key={category._id}
                className="has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-transparent block cursor-pointer text-lg p-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                <input
                  type="radio"
                  id={`cat-radio-${index}`}
                  name="category"
                  value={category._id}
                  onChange={() => handleCategorySelect(category._id)}
                  className="hidden peer" // 숨김 처리
                  autoComplete="off"
                />
                {`${category.name_ko} / ${category.name_ja}`}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSubmit={(korean, japanese) => {
          if (
            modalState.mode === "add" &&
            modalState.dataType === "classification"
          ) {
            handleAddClassification(korean, japanese);
          } else if (
            modalState.mode === "edit" &&
            modalState.dataType === "classification"
          ) {
            handleEditClassification(korean, japanese, modalState.editingId!);
          } else if (
            modalState.mode === "add" &&
            modalState.dataType === "category"
          ) {
            handleAddCategory(korean, japanese);
          } else if (
            modalState.mode === "edit" &&
            modalState.dataType === "category"
          ) {
            handleEditCategory(korean, japanese, modalState.editingId!);
          }
        }}
        title={
          modalState.mode === "add" && modalState.dataType === "classification"
            ? "Add Classification"
            : modalState.mode === "edit" &&
              modalState.dataType === "classification"
            ? "Edit Classification"
            : modalState.mode === "add" && modalState.dataType === "category"
            ? "Add Category"
            : modalState.mode === "edit" && modalState.dataType === "category"
            ? "Edit Category"
            : ""
        }
      />
    </div>
  );
};

export default MainContent;
