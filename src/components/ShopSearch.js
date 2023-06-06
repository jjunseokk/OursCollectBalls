import React, { useEffect, useState } from "react";
import '../style/reservation.scss';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faSearch, faAnglesRight, faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

import { useDispatch } from 'react-redux'
import { addState, collectState } from "../redux/store";

import golf from '../img/golf.png';
import warning from '../img/warning.png';
import axios from "axios";

const ShopSearch = () => {

    const [qving, setQving] = useState([]);


    // 검색 할때 저장하는 state
    const [searchTerm, setSearchTerm] = useState('');

    // 지역 선택 할 때 인덱스
    const [select, setSelect] = useState(null);

    // 지역 저장 state
    const [add, setAdd] = useState('');

    // 볼수거량 저장
    const [collect, setCollect] = useState('');

    // 버튼 액티브
    const [active, setActive] = useState('');

    // 사용자가 입력한 지역, 매장명, 주소, 전화번호 저장
    const [formData, setFormData] = useState({
        shop: '',
        address: '',
        phone: ''
    });

    const dispatch = useDispatch();


    // 페이지네이션을 위한 변수들
    const itemsPerPage = 10; // 페이지당 보여줄 항목 수
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지


    // 지역과 매장명에 따라 필터링된 항목들을 반환하는 함수
    const filterItems = (items) => {
        const combinedSearchTerm = searchTerm.toLowerCase();
        if (!items) {
            return []; // 예외 처리: items가 undefined인 경우 빈 배열 반환
        }
        return items.filter((item) => {
            const combinedItemData = ` ${item.com_code_store_name} ${item.com_address1} ${item.hphone}`.toLowerCase();
            return (
                (combinedItemData.includes(combinedSearchTerm) || searchTerm.trim() === '')
            );
        });
    };

    // 검색어 및 지역에 따라 필터링된 항목들을 반환
    const filteredItems = filterItems(qving);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage); // 총 페이지 수

    // 현재 페이지에서 필터링된 항목들을 표시하기 위해 currentItems 변수에 할당
    const currentItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // 페이지 변경 함수
    const handleChangePage = (page) => {
        setCurrentPage(page);
    };

    // 페이지 변경 함수 - 첫 페이지로 이동
    const handleFirstPage = () => {
        setCurrentPage(1);
    };

    // 페이지 변경 함수 - 마지막 페이지로 이동
    const handleLastPage = () => {
        setCurrentPage(totalPages);
    };

    // 페이지네이션 버튼들을 표시하기 위한 배열 생성
    const paginationButtons = [];
    const maxVisibleButtons = 10; // 최대 표시할 버튼 수

    let startPage = 1;
    let endPage = totalPages;


    // 현재 페이지를 중심으로 최대 표시할 버튼 수를 유지하도록 startPage와 endPage를 설정
    if (totalPages > maxVisibleButtons) {
        const halfVisibleButtons = Math.floor(maxVisibleButtons / 2);
        if (currentPage <= halfVisibleButtons) {
            endPage = maxVisibleButtons;
        } else if (currentPage + halfVisibleButtons > totalPages) {
            startPage = totalPages - maxVisibleButtons + 1;
        } else {
            startPage = currentPage - halfVisibleButtons;
            endPage = currentPage + halfVisibleButtons;
        }
    }

    // 페이지네이션 버튼 생성
    for (let i = startPage; i <= endPage; i++) {
        paginationButtons.push(
            <button
                key={i}
                className={currentPage === i ? "event-active" : ""}
                onClick={() => handleChangePage(i)}
            >
                {i}
            </button>
        );
    }


    // input 검색
    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    // item 중 선택된 체크박스 데이터만 전달 
    const handleInputChange = (index) => {
        setSelect(index);
        setAdd(currentItems[index]);
    };

    // 무게 선택
    const colletSelect = (index) => {
        setCollect(index);
        setActive(index);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        // 전화번호 입력 시 자동으로 하이푼(-) 추가
        if (name === 'phone') {
            const phoneNumber = value.replace(/-/g, ''); // 기존 하이픈 제거
            const formattedPhoneNumber = phoneNumber
                .replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3'); // 하이픈 추가
            setFormData((prevData) => ({
                ...prevData,
                [name]: formattedPhoneNumber
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value
            }));
        }
    };


    // 추가하기 버튼을 누르면 작동 이벤트
    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.phone.length == 13) {
            alert('성공적으로 추가되었습니다.')

            axios.post('/addData', formData)
                .then((response) => {
                    console.log(response)
                })
                .catch((error) => {
                    console.error(error);
                });
            console.log(formData);

            // 입력값 초기화
            setFormData({
                shop: '',
                address: '',
                phone: ''
            });
        } else {
            alert('전화번호 13자리를 올바르게 입력하세요.')
        }


        console.log(formData);



    };

    // 큐빙 데이터 가져오기
    useEffect(() => {
        axios.post('/qving')
            .then(response => {
                setQving(response.data.data);
                // console.log("큐빙 get", response.data.data);
            })
            .catch(error => console.error(error))
    }, [])
    // ------------------------------------------------

    // 주소 선택 값이 바뀌면 dispatch로 redux에 저장
    useEffect(() => {
        if (add) {
            const { com_code_store_name, com_address1 } = add; // 수정된 부분: shop -> com_code_store_name, address -> com_address1
            dispatch(addState({ shop: com_code_store_name, address: com_address1 })); // 수정된 부분: spot, shop, address의 변수명 변경
        }
    }, [add, dispatch]);

    // 무게가 값이 바뀌면 redux에 저장
    useEffect(() => {
        dispatch(collectState(collect));
    }, [collect, dispatch])



    return (
        <div className="reservation-result">
            <div className="shop-searchZone">
                <div className="select-zone">
                    <div className="shop-search">
                        <h4>매장 찾기</h4>
                        <div className="shop-selectArea">

                        </div>
                        <input style={{ padding: 10 }} type="text" value={searchTerm} onChange={handleSearch} placeholder="매장명을 입력하세요." />
                        <FontAwesomeIcon icon={faSearch} className="shop-searchIcon" />
                    </div>
                    <div className="shop">
                        <h4><img src={golf} alt="" width="10px" /> 로스트볼 수거량</h4>
                        <div className="collect-weight">
                            <button
                                onClick={() => {
                                    colletSelect('1톤 이하');
                                }}
                                className={active === '1톤 이하' ? 'selected' : ''}
                            >
                                1톤 이하
                            </button>
                            <button
                                onClick={() => {
                                    colletSelect('1톤 이상');
                                }}
                                className={active === '1톤 이상' ? 'selected' : ''}
                            >
                                1톤 이상
                            </button>
                            <button
                                onClick={() => {
                                    colletSelect('2톤 이상');
                                }}
                                className={active === '2톤 이상' ? 'selected' : ''}
                            >
                                2톤 이상
                            </button>
                            <button
                                onClick={() => {
                                    colletSelect('5톤 이상');
                                }}
                                className={active === '5톤 이상' ? 'selected' : ''}
                            >
                                5톤 이상
                            </button>
                        </div>
                        <p style={{ color: 'red', fontSize: 2, marginTop: 5 }}>
                            <img src={warning} alt="" width="10px" /> 1톤 이하의 볼 수거는 추가 비용이 발생합니다.
                        </p>
                    </div>
                </div>

                <div className="input-zone">
                    <h4>찾으시는 매장이 없으신가요?</h4>
                    <p>* 추가하기 버튼을 누르시면 아래의 리스트의 추가 됩니다.</p>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="shop"
                            placeholder="매장명을 입력하세요"
                            value={formData.shop || ''}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="주소를 입력하세요"
                            value={formData.address || ''}
                            onChange={handleChange}
                        />
                        <input
                            type="text"
                            name="phone"
                            placeholder="전화번호를 입력하세요"
                            value={formData.phone || ''}
                            onChange={handleChange}
                            maxLength='13'
                        />
                        <button type="submit">추가하기</button>
                    </form>
                </div>
            </div>
            <div className="shop-table">
                <table>
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>매장명</th>
                            <th>주소</th>
                            {/* <th>전화번호</th> */}
                            <th>선택</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item, index) => {
                            const currentIndex = (currentPage - 1) * itemsPerPage + index;
                            return (
                                <tr key={`${item.com_code_store_name}-${index}`}>
                                    <td>{currentIndex + 1}</td>
                                    <td>{item.com_code_store_name}</td>
                                    <td>{item.com_address1}</td>
                                    {/* <td>{item.hphone ? item.hphone : "번호없음"}</td> */}
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={select === index} // 선택된 인덱스에만 checked 속성 추가
                                            onChange={() => {
                                                handleInputChange(index);
                                            }}
                                        />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div className="event-pagination">
                    {currentPage > 1 && (
                        <>
                            <button
                                className="event-pagination-button"
                                onClick={handleFirstPage}
                            >
                                <FontAwesomeIcon icon={faAnglesLeft} />
                            </button>
                            <button
                                className="event-pagination-button"
                                onClick={() => handleChangePage(currentPage - 1)}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                        </>
                    )}
                    {paginationButtons}
                    {currentPage < totalPages && (
                        <>
                            <button
                                className="event-pagination-button"
                                onClick={() => handleChangePage(currentPage + 1)}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                            <button
                                className="event-pagination-button"
                                onClick={handleLastPage}
                            >
                                <FontAwesomeIcon icon={faAnglesRight} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}


export default ShopSearch;