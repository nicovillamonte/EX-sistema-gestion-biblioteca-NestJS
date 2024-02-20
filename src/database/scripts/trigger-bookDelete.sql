USE bibliogestion;

DROP TRIGGER IF EXISTS after_book_delete;

DELIMITER $$

CREATE TRIGGER after_book_delete
AFTER DELETE ON book
FOR EACH ROW
BEGIN
    -- Identificar y eliminar autores que ya no están asociados a ningún libro
    DELETE FROM author
    WHERE id IN (
        SELECT a.id
        FROM author a
        LEFT JOIN book_authors_author baa ON a.id = baa.authorId
        GROUP BY a.id
        HAVING COUNT(baa.bookISBN) = 0
    );
END$$

DELIMITER ;
